package com.example.aiexhibition.global;

import com.example.aiexhibition.global.config.SeedMetadata;
import com.example.aiexhibition.global.config.SeedMetadataRepository;
import java.lang.management.ManagementFactory;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 서버가 정상 실행 중인지, 어떤 DB/브랜치/seed 데이터로 떠 있는지 확인하는 진단용 API다.
 */
@RestController
public class HealthController {

    // 서버가 시작된 시각이다. health 응답에서 uptime 계산과 함께 노출한다.
    private static final Instant STARTED_AT = Instant.now();

    // application.yml, 환경변수, active profile 같은 실행 환경 값을 읽을 때 사용한다.
    private final Environment environment;
    // seed 데이터가 현재 DB에 어떤 버전으로 적용됐는지 확인할 때 사용한다.
    private final SeedMetadataRepository seedMetadataRepository;

    public HealthController(Environment environment, SeedMetadataRepository seedMetadataRepository) {
        this.environment = environment;
        this.seedMetadataRepository = seedMetadataRepository;
    }

    @GetMapping({"/health", "/api/health"})
    public Map<String, Object> health() {
        // 실행 프로필, DB 종류, Git 버전, seed 상태를 함께 반환해
        // 현재 작업 트리의 서버가 맞게 실행 중인지 개발 스크립트가 확인할 수 있다.
        SeedMetadata seed = seedMetadataRepository.findById("gallery").orElse(null);
        String datasourceUrl = environment.getProperty("spring.datasource.url", "");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("profiles", environment.getActiveProfiles());
        response.put("dbType", datasourceUrl.startsWith("jdbc:h2:") ? "H2" : "Oracle");
        response.put("gitCommit", identity("GIT_COMMIT", "rev-parse", "--short", "HEAD"));
        response.put("branch", identity("GIT_BRANCH", "branch", "--show-current"));
        String gitStatus = git("status", "--porcelain");
        response.put("dirty", "unknown".equals(gitStatus) ? null : !gitStatus.isBlank());
        response.put("seedVersion", seed == null ? null : seed.getVersion());
        response.put("seedChecksum", seed == null ? null : seed.getChecksum());
        response.put("startedAt", STARTED_AT);
        response.put("uptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        return response;
    }

    // 환경변수로 주입된 값이 있으면 우선 사용하고, 없으면 Git 명령으로 직접 조회한다.
    private String identity(String property, String... gitArguments) {
        String configured = environment.getProperty(property);
        return configured == null || configured.isBlank() ? git(gitArguments) : configured;
    }

    // 현재 저장소의 커밋/브랜치/dirty 상태를 짧게 읽어오는 보조 메서드다.
    private String git(String... arguments) {
        try {
            // 상태 API가 오래 멈추지 않도록 Git 명령은 최대 2초만 기다린다.
            String[] command = new String[arguments.length + 3];
            command[0] = "git";
            command[1] = "-C";
            command[2] = "..";
            System.arraycopy(arguments, 0, command, 3, arguments.length);

            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            if (!process.waitFor(2, TimeUnit.SECONDS) || process.exitValue() != 0) {
                process.destroyForcibly();
                return "unknown";
            }
            return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (Exception exception) {
            return "unknown";
        }
    }
}
