package com.example.aiexhibition.global.config;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitPosition;
import com.example.aiexhibition.exhibit.ExhibitPositionRepository;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.hall.Hall;
import com.example.aiexhibition.hall.HallRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            HallRepository hallRepository,
            ExhibitRepository exhibitRepository,
            ExhibitPositionRepository exhibitPositionRepository
    ) {
        return args -> {
            System.out.println(">>> DataInitializer: checking exhibits count...");
            long count = exhibitRepository.count();
            System.out.println(">>> DataInitializer: exhibits count = " + count);
            if (count > 0) {
                System.out.println(">>> DataInitializer: skipping seed (data already exists)");
                return;
            }
            System.out.println(">>> DataInitializer: seeding data...");

            Hall mainHall = hallRepository.save(new Hall(
                    "Main Gallery",
                    "A quiet virtual room for AI-curated artworks.",
                    1.6, "#e8e0d2", "#9a9488", "#ded8cb",
                    "#ffffff", 1.18
            ));
            Hall spaceHall = hallRepository.save(new Hall(
                    "Space Gallery",
                    "A cosmic journey through generative star fields and nebulae.",
                    1.6, "#d4cec4", "#a09888", "#cac4b8",
                    "#ffffff", 1.0
            ));
            Hall historyHall = hallRepository.save(new Hall(
                    "History & Art Gallery",
                    "A warm marble hall featuring classical sculptures from ancient Greece to modern times.",
                    1.6, "#d4c9b8", "#a89880", "#c4b8a8",
                    "#f5e6d0", 0.9
            ));

            Exhibit silentHorizon = exhibitRepository.save(new Exhibit(
                    "Silent Horizon", "AI Exhibition Studio",
                    "A quiet landscape that balances empty space and soft light.",
                    "image", null, 0, 0.0, null, false,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
                    null, null, null, mainHall
            ));
            Exhibit galleryVideo = exhibitRepository.save(new Exhibit(
                    "Gallery Video", null, "전시 소개 영상을 감상할 수 있습니다.",
                    "youtube", "klIxS5o65C4", 0, 0.0, null, false,
                    null, null, null, null, mainHall
            ));
            Exhibit signalGarden = exhibitRepository.save(new Exhibit(
                    "Signal Garden", "AI Exhibition Studio",
                    "Digital signals bloom into a shifting garden of color.",
                    "image", null, 0, 0.0, null, true,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
                    null, null, null, mainHall
            ));
            Exhibit greenHour = exhibitRepository.save(new Exhibit(
                    "Green Hour", "AI Exhibition Studio",
                    "A study in calm green light and layered atmosphere.",
                    "image", null, 1, Math.PI / 2, null, false,
                    null, null, null, null, mainHall
            ));
            Exhibit quietStreet = exhibitRepository.save(new Exhibit(
                    "Quiet Street", "AI Exhibition Studio",
                    "An empty street holds the stillness of a paused afternoon.",
                    "image", null, 1, Math.PI / 2, null, true,
                    null, null, null, null, mainHall
            ));
            Exhibit blueRoom = exhibitRepository.save(new Exhibit(
                    "Blue Room", "AI Exhibition Studio",
                    "Cool light fills an interior built from simple shapes.",
                    "image", null, 2, -Math.PI / 2, null, true,
                    null, null, null, null, mainHall
            ));
            Exhibit stoneLight = exhibitRepository.save(new Exhibit(
                    "Stone Light", "AI Exhibition Studio",
                    "Warm light settles over a sculptural stone surface.",
                    "image", null, 2, -Math.PI / 2, null, false,
                    null, null, null, null, mainHall
            ));
            Exhibit starryNight = exhibitRepository.save(new Exhibit(
                    "별이 빛나는 밤에 (The Starry Night)",
                    "빈센트 반 고흐 (Vincent van Gogh)",
                    "1889년 작품으로, 요동치는 꿈틀거리는 듯한 붓놀림과 강렬한 푸른색, 소용돌이치는 노란 별빛이 특징인 후기 인상주의의 대표작입니다.",
                    "image", null, 3, Math.PI, null, true,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg",
                    null, null, null, mainHall
            ));
            Exhibit portalToSpace = exhibitRepository.save(new Exhibit(
                    "Space Gallery Entrance", null, "다음 전시실로 이동합니다.",
                    "portal", "2", 2, -Math.PI / 2, null, false,
                    null, -6.5, 6.4, -Math.PI / 2, mainHall
            ));

            Exhibit nebulaDream = exhibitRepository.save(new Exhibit(
                    "Nebula Dream", "AI Exhibition Studio",
                    "A violet cloud of starlight drifts through deep space.",
                    "image", null, 0, 0.0, null, false,
                    null, null, null, null, spaceHall
            ));
            Exhibit stellarDrift = exhibitRepository.save(new Exhibit(
                    "Stellar Drift", "AI Exhibition Studio",
                    "Stars stretch across the dark in a slow celestial current.",
                    "image", null, 0, 0.0, null, true,
                    null, null, null, null, spaceHall
            ));
            Exhibit cosmicDust = exhibitRepository.save(new Exhibit(
                    "Cosmic Dust", "AI Exhibition Studio",
                    "Fine particles glow at the edge of an imagined galaxy.",
                    "image", null, 0, 0.0, null, false,
                    null, null, null, null, spaceHall
            ));
            Exhibit starField = exhibitRepository.save(new Exhibit(
                    "Star Field", "AI Exhibition Studio",
                    "A dense field of stars opens beyond the gallery wall.",
                    "image", null, 2, -Math.PI / 2, null, true,
                    null, null, null, null, spaceHall
            ));
            Exhibit deepSpaceSignal = exhibitRepository.save(new Exhibit(
                    "Deep Space Signal", "AI Exhibition Studio",
                    "A distant transmission flickers against a dark horizon.",
                    "image", null, 1, Math.PI / 2, null, false,
                    null, null, null, null, spaceHall
            ));
            Exhibit portalToMain = exhibitRepository.save(new Exhibit(
                    "Return to Main Gallery", null, "메인 전시실로 돌아갑니다.",
                    "portal", "1", 1, Math.PI / 2, null, false,
                    null, 6.5, -6.6, Math.PI / 2, spaceHall
            ));
            Exhibit portalFromHistory = exhibitRepository.save(new Exhibit(
                    "Return to Main Gallery", null, "메인 전시실로 돌아갑니다.",
                    "portal", "1", 1, Math.PI / 2, null, false,
                    null, 6.5, -4.0, Math.PI / 2, historyHall
            ));

            exhibitPositionRepository.saveAll(List.of(
                    new ExhibitPosition(silentHorizon, -4.8, 2.18, -10.82),
                    new ExhibitPosition(galleryVideo, -1.8, 2.18, -10.82),
                    new ExhibitPosition(signalGarden, 3.3, 2.18, -10.82),
                    new ExhibitPosition(greenHour, -8.82, 2.18, -4.5),
                    new ExhibitPosition(quietStreet, -8.82, 2.18, 3.1),
                    new ExhibitPosition(blueRoom, 8.82, 2.18, -3.8),
                    new ExhibitPosition(stoneLight, 8.82, 2.18, 4.5),
                    new ExhibitPosition(starryNight, 0.0, 2.18, 10.82),
                    new ExhibitPosition(portalToSpace, 8.72, 1.82, -6.6),
                    new ExhibitPosition(nebulaDream, -4.9, 2.18, -10.82),
                    new ExhibitPosition(stellarDrift, 0.2, 2.14, -10.82),
                    new ExhibitPosition(cosmicDust, 5.2, 2.18, -10.82),
                    new ExhibitPosition(starField, 8.82, 2.18, 2.2),
                    new ExhibitPosition(deepSpaceSignal, -8.82, 2.18, -3.2),
                    new ExhibitPosition(portalToMain, -8.72, 1.82, 6.4),
                    new ExhibitPosition(portalFromHistory, -8.72, 1.82, 6.4)
            ));
        };
    }
}
