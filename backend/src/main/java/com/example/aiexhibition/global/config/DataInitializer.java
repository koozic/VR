package com.example.aiexhibition.global.config;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitPosition;
import com.example.aiexhibition.exhibit.ExhibitPositionRepository;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.hall.Hall;
import com.example.aiexhibition.hall.HallRepository;
import com.example.aiexhibition.keyword.ExhibitKeyword;
import com.example.aiexhibition.keyword.ExhibitKeywordRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class DataInitializer {

    // SEED_METADATA 테이블에서 이 이름으로 전시 seed 적용 상태를 관리한다.
    private static final String SEED_NAME = "gallery";

    @Bean
    CommandLineRunner seedData(
            ObjectMapper objectMapper,
            HallRepository hallRepository,
            ExhibitRepository exhibitRepository,
            ExhibitPositionRepository exhibitPositionRepository,
            ExhibitKeywordRepository exhibitKeywordRepository,
            SeedMetadataRepository seedMetadataRepository
    ) {
        return args -> {
            // 애플리케이션 시작 시 classpath의 gallery-seed.json과 SHA-256 체크섬을 읽는다.
            SeedResource seedResource = readSeed(objectMapper);
            GallerySeed seed = seedResource.seed();
            SeedMetadata metadata = seedMetadataRepository.findById(SEED_NAME).orElse(null);
            // DB에 기록된 버전과 파일 내용이 모두 같으면 불필요한 재생성을 건너뛴다.
            if (metadata != null
                    && metadata.getVersion() >= seed.version()
                    && seedResource.checksum().equals(metadata.getChecksum())) {
                System.out.println(">>> Gallery seed is up to date (v" + seed.version()
                        + ", " + shortChecksum(seedResource.checksum()) + ")");
                return;
            }

            System.out.println(">>> Applying gallery seed v" + seed.version()
                    + " (" + shortChecksum(seedResource.checksum()) + ")");
            // 외래 키 관계를 지키기 위해 자식 테이블부터 삭제한다.
            // 주의: seed가 다시 적용되면 기존 작품/좌표/키워드 데이터가 재생성된다.
            exhibitPositionRepository.deleteAll();
            exhibitKeywordRepository.deleteAll();
            exhibitRepository.deleteAll();

            // 전시관을 먼저 저장해야 작품이 참조할 Hall 엔티티와 실제 DB ID를 알 수 있다.
            Map<String, Hall> hallsByKey = saveHalls(seed.halls(), hallRepository);
            saveExhibits(
                    seed.halls(),
                    hallsByKey,
                    exhibitRepository,
                    exhibitPositionRepository,
                    exhibitKeywordRepository
            );

            if (metadata == null) {
                metadata = new SeedMetadata(SEED_NAME, seed.version(), seedResource.checksum());
            } else {
                metadata.update(seed.version(), seedResource.checksum());
            }
            seedMetadataRepository.save(metadata);
        };
    }

    private SeedResource readSeed(ObjectMapper objectMapper) throws IOException {
        // Maven 설정에서 ../shared가 resource로 포함되어 있어 classpath에서 읽을 수 있다.
        ClassPathResource resource = new ClassPathResource("gallery-seed.json");
        byte[] bytes = resource.getInputStream().readAllBytes();
        return new SeedResource(objectMapper.readValue(bytes, GallerySeed.class), sha256(bytes));
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String shortChecksum(String checksum) {
        return checksum.substring(0, 12);
    }

    private Map<String, Hall> saveHalls(List<HallSeed> hallSeeds, HallRepository hallRepository) {
        // JSON의 key(main, space 등)를 실제 저장된 Hall 엔티티에 연결하는 임시 Map이다.
        Map<String, Hall> hallsByKey = new HashMap<>();
        for (HallSeed seed : hallSeeds) {
            Hall hall = hallRepository.findById(seed.id())
                    .orElseGet(() -> new Hall(seed.name(), seed.description()));
            hall.update(
                    seed.name(),
                    seed.description(),
                    seed.cameraY(),
                    seed.wallColor(),
                    seed.floorColor(),
                    seed.ceilingColor(),
                    seed.ambientLightColor(),
                    seed.lightIntensity()
            );
            hall = hallRepository.save(hall);
            hallsByKey.put(seed.key(), hall);
        }
        return hallsByKey;
    }

    private void saveExhibits(
            List<HallSeed> hallSeeds,
            Map<String, Hall> hallsByKey,
            ExhibitRepository exhibitRepository,
            ExhibitPositionRepository exhibitPositionRepository,
            ExhibitKeywordRepository exhibitKeywordRepository
    ) {
        for (HallSeed hallSeed : hallSeeds) {
            Hall hall = requireHall(hallsByKey, hallSeed.key());
            for (ExhibitSeed seed : hallSeed.exhibits()) {
                // portal의 contentUrl에는 JSON의 targetHallKey 대신 실제 대상 전시관 ID를 저장한다.
                String contentUrl = seed.targetHallKey() == null
                        ? seed.contentUrl()
                        : String.valueOf(requireHall(hallsByKey, seed.targetHallKey()).getId());
                Exhibit exhibit = exhibitRepository.save(new Exhibit(
                        seed.title(),
                        seed.creator(),
                        seed.description(),
                        seed.exampleText(),
                        seed.type(),
                        contentUrl,
                        seed.wallIndex(),
                        seed.rotationY(),
                        seed.scale(),
                        seed.wide(),
                        seed.thumbnailUrl(),
                        seed.portalTargetX(),
                        seed.portalTargetZ(),
                        seed.portalTargetYaw(),
                        hall
                ));
                exhibitPositionRepository.save(new ExhibitPosition(
                        exhibit,
                        seed.positionX(),
                        seed.positionY(),
                        seed.positionZ()
                ));
                // 키워드는 작품과 다대일 관계인 별도 행으로 하나씩 저장한다.
                for (String keyword : seed.keywords() == null ? List.<String>of() : seed.keywords()) {
                    exhibitKeywordRepository.save(new ExhibitKeyword(keyword, exhibit));
                }
            }
        }
    }

    private Hall requireHall(Map<String, Hall> hallsByKey, String key) {
        // seed에 잘못된 targetHallKey가 있으면 조용히 넘어가지 않고 시작 단계에서 실패시킨다.
        Hall hall = hallsByKey.get(key);
        if (hall == null) {
            throw new IllegalStateException("Unknown hall key in gallery seed: " + key);
        }
        return hall;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GallerySeed(Integer version, List<HallSeed> halls) {
    }

    private record SeedResource(GallerySeed seed, String checksum) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record HallSeed(
            Long id,
            String key,
            String name,
            String description,
            Double cameraY,
            String wallColor,
            String floorColor,
            String ceilingColor,
            String ambientLightColor,
            Double lightIntensity,
            List<ExhibitSeed> exhibits
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ExhibitSeed(
            Long id,
            String title,
            String creator,
            String description,
            List<String> keywords,
            String exampleText,
            String type,
            String contentUrl,
            String targetHallKey,
            Integer wallIndex,
            Double rotationY,
            Double scale,
            Boolean wide,
            String thumbnailUrl,
            Double portalTargetX,
            Double portalTargetZ,
            Double portalTargetYaw,
            Double positionX,
            Double positionY,
            Double positionZ
    ) {
    }
}
