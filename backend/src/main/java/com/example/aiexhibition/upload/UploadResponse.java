package com.example.aiexhibition.upload;

// 파일 업로드 후 프런트엔드에 돌려주는 파일 정보다.
public record UploadResponse(
        String url,
        String originalFilename,
        String storedFilename,
        String contentType,
        long size
) {
}
