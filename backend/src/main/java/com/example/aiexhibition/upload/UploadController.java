package com.example.aiexhibition.upload;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(
            @RequestParam("file") MultipartFile file
    ) {
        UploadService.StoredUpload storedUpload = uploadService.store(file);
        String url = "/uploads/" + storedUpload.storedFilename();

        return new UploadResponse(
                url,
                storedUpload.originalFilename(),
                storedUpload.storedFilename(),
                storedUpload.contentType(),
                storedUpload.size()
        );
    }
}
