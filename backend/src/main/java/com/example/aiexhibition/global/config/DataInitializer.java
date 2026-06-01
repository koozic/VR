package com.example.aiexhibition.global.config;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitPosition;
import com.example.aiexhibition.exhibit.ExhibitPositionRepository;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.hall.Hall;
import com.example.aiexhibition.hall.HallRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            HallRepository hallRepository,
            ExhibitRepository exhibitRepository,
            ExhibitPositionRepository exhibitPositionRepository
    ) {
        return args -> {
            if (exhibitRepository.count() > 0) {
                return;
            }

            Hall mainHall = hallRepository.save(new Hall(
                    "Main Gallery",
                    "A quiet virtual room for AI-curated artworks.",
                    1.6, "#e8e0d2", "#9a9488", "#ded8cb",
                    "#ffffff", 1.18
            ));
            Hall spaceHall = hallRepository.save(new Hall(
                    "Space Gallery",
                    "A cosmic journey through generative star fields and nebulae.",
                    9.6, "#0a0a1a", "#111128", "#0d0d22",
                    "#4466aa", 0.8
            ));

            Exhibit silentHorizon = exhibitRepository.save(new Exhibit(
                    "Silent Horizon", "AI Exhibition Studio",
                    "A calm study of light, depth, and stillness inside a virtual room.",
                    "image", null, 0, 0.0, null, null, null, null, null, null,
                    mainHall
            ));
            Exhibit signalGarden = exhibitRepository.save(new Exhibit(
                    "Signal Garden", "AI Exhibition Studio",
                    "Layered color fields that respond to the visitor path through the gallery.",
                    "image", null, 0, 0.0, null, true, null, null, null, null,
                    mainHall
            ));
            Exhibit nebulaDream = exhibitRepository.save(new Exhibit(
                    "Nebula Dream", "Cosmic AI",
                    "Swirling clouds of cosmic dust and gas.",
                    "image", null, 0, 0.0, null, null, null, null, null, null,
                    spaceHall
            ));
            Exhibit starField = exhibitRepository.save(new Exhibit(
                    "Star Field", "Cosmic AI",
                    "Countless stars scattered across the void.",
                    "image", null, 1, 0.0, null, true, null, null, null, null,
                    spaceHall
            ));

            exhibitPositionRepository.saveAll(List.of(
                    new ExhibitPosition(silentHorizon, -2.0, 2.18, -3.82),
                    new ExhibitPosition(signalGarden, 2.0, 2.18, -3.82),
                    new ExhibitPosition(nebulaDream, -2.0, 2.18, -3.82),
                    new ExhibitPosition(starField, 2.0, 2.18, -3.82)
            ));
        };
    }
}

