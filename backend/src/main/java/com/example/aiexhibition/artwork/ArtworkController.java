package com.example.aiexhibition.artwork;

import com.example.aiexhibition.artwork.dto.ArtworkResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/artworks")
public class ArtworkController {

    private final ArtworkService artworkService;

    public ArtworkController(ArtworkService artworkService) {
        this.artworkService = artworkService;
    }

    @GetMapping
    public List<ArtworkResponse> findAll() {
        return artworkService.findAll();
    }

    @GetMapping("/{id}")
    public ArtworkResponse findById(@PathVariable Long id) {
        return artworkService.findById(id);
    }
}

