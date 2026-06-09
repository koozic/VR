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
            SeedResource seedResource = readSeed(objectMapper);
            GallerySeed seed = seedResource.seed();
            SeedMetadata metadata = seedMetadataRepository.findById(SEED_NAME).orElse(null);
            if (metadata != null
                    && metadata.getVersion() >= seed.version()
                    && seedResource.checksum().equals(metadata.getChecksum())) {
                System.out.println(">>> Gallery seed is up to date (v" + seed.version()
                        + ", " + shortChecksum(seedResource.checksum()) + ")");
                return;
            }

            System.out.println(">>> Applying gallery seed v" + seed.version()
                    + " (" + shortChecksum(seedResource.checksum()) + ")");
            exhibitPositionRepository.deleteAll();
            exhibitKeywordRepository.deleteAll();
            exhibitRepository.deleteAll();

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
                for (String keyword : seed.keywords() == null ? List.<String>of() : seed.keywords()) {
                    exhibitKeywordRepository.save(new ExhibitKeyword(keyword, exhibit));
                }
            }
        }
    }

    private Hall requireHall(Map<String, Hall> hallsByKey, String key) {
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
