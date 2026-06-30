package com.example.aiexhibition.upload;

import java.time.Duration;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    private final UploadService uploadService;

    public UploadResourceConfig(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadService.resourceLocation())
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)));
    }
}
