package com.example.aiexhibition.upload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadService {

    private static final long MAX_FILE_BYTES = 25L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".mp4", ".webm", ".mov"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "application/octet-stream"
    );

    private final Path storageDirectory;

    public UploadService(@Value("${app.upload.storage-dir:uploads}") String storageDirectory) {
        this.storageDirectory = Paths.get(storageDirectory).toAbsolutePath().normalize();
    }

    public StoredUpload store(MultipartFile file) {
        validateFile(file);

        try {
            Files.createDirectories(storageDirectory);
            String originalFilename = cleanOriginalFilename(file);
            String extension = extensionOf(originalFilename);
            String storedFilename = UUID.randomUUID() + extension;
            Path target = storageDirectory.resolve(storedFilename).normalize();

            if (!target.startsWith(storageDirectory)) {
                throw new IllegalArgumentException("Invalid upload path.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return new StoredUpload(
                    originalFilename,
                    storedFilename,
                    safeContentType(file),
                    file.getSize()
            );
        } catch (IOException exception) {
            throw new IllegalStateException("파일을 저장하지 못했습니다.", exception);
        }
    }

    public String resourceLocation() {
        String location = storageDirectory.toUri().toString();
        return location.endsWith("/") ? location : location + "/";
    }

    private static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일을 선택해 주세요.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new IllegalArgumentException("파일은 25MB 이하만 업로드할 수 있습니다.");
        }

        String originalFilename = cleanOriginalFilename(file);
        String extension = extensionOf(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("이미지 또는 mp4/webm/mov 영상만 업로드할 수 있습니다.");
        }

        String contentType = safeContentType(file);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + contentType);
        }
    }

    private static String cleanOriginalFilename(MultipartFile file) {
        String filename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename()
        );
        if (filename.contains("..")) {
            throw new IllegalArgumentException("Invalid file name.");
        }
        return filename;
    }

    private static String extensionOf(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0) {
            throw new IllegalArgumentException("파일 확장자가 필요합니다.");
        }
        return filename.substring(index).toLowerCase(Locale.ROOT);
    }

    private static String safeContentType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType == null || contentType.isBlank()
                ? "application/octet-stream"
                : contentType.toLowerCase(Locale.ROOT);
    }

    public record StoredUpload(
            String originalFilename,
            String storedFilename,
            String contentType,
            long size
    ) {
    }
}
