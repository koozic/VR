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
                    "A quiet virtual room for AI-curated artworks."
            ));

            Exhibit silentHorizon = exhibitRepository.save(new Exhibit(
                    "Silent Horizon",
                    "AI Exhibition Studio",
                    "A calm study of light, depth, and stillness inside a virtual room.",
                    mainHall
            ));
            Exhibit signalGarden = exhibitRepository.save(new Exhibit(
                    "Signal Garden",
                    "AI Exhibition Studio",
                    "Layered color fields that respond to the visitor path through the gallery.",
                    mainHall
            ));

            exhibitPositionRepository.saveAll(List.of(
                    new ExhibitPosition(silentHorizon, -2.0, 2.0, -3.82),
                    new ExhibitPosition(signalGarden, 2.0, 2.0, -3.82)
            ));
        };
    }
}

