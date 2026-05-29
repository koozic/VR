package com.example.aiexhibition.global.config;

import com.example.aiexhibition.artist.Artist;
import com.example.aiexhibition.artist.ArtistRepository;
import com.example.aiexhibition.artwork.Artwork;
import com.example.aiexhibition.artwork.ArtworkRepository;
import com.example.aiexhibition.keyword.ArtworkKeyword;
import com.example.aiexhibition.keyword.ArtworkKeywordRepository;
import com.example.aiexhibition.room.Room;
import com.example.aiexhibition.room.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            RoomRepository roomRepository,
            ArtistRepository artistRepository,
            ArtworkRepository artworkRepository,
            ArtworkKeywordRepository artworkKeywordRepository
    ) {
        return args -> {
            if (artworkRepository.count() > 0) {
                return;
            }

            Room mainRoom = roomRepository.save(new Room(
                    "Main Gallery",
                    "A quiet virtual room for AI-curated artworks.",
                    1.6,
                    "#e8e0d2", "#9a9488", "#ded8cb",
                    "#ffffff", 1.18
            ));
            Room spaceRoom = roomRepository.save(new Room(
                    "Space Gallery",
                    "A cosmic journey through generative star fields and nebulae.",
                    9.6,
                    "#0a0a1a", "#111128", "#0d0d22",
                    "#4466aa", 0.8
            ));
            Artist studio = artistRepository.save(new Artist(
                    "AI Exhibition Studio",
                    "A digital studio exploring generated narratives and spatial exhibitions."
            ));
            Artist cosmic = artistRepository.save(new Artist(
                    "Cosmic AI",
                    "Generative artist exploring deep space and celestial phenomena."
            ));

            Artwork silentHorizon = artworkRepository.save(new Artwork(
                    "Silent Horizon", 2026,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
                    "A calm study of light, depth, and stillness inside a virtual room.",
                    "image", null, 0, -4.8, 2.18, -10.82, 0.0, null, null, null,
                    studio, mainRoom
            ));
            Artwork galleryVideo = artworkRepository.save(new Artwork(
                    "Gallery Video", null,
                    null, "전시와 함께 감상할 수 있는 영상입니다.",
                    "youtube", "klIxS5o65C4", 0, -1.8, 2.18, -10.82, 0.0, null, null, null,
                    studio, mainRoom
            ));
            Artwork signalGarden = artworkRepository.save(new Artwork(
                    "Signal Garden", 2026,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
                    "Layered color fields that respond to the visitor path through the gallery.",
                    "image", null, 0, 3.3, 2.18, -10.82, 0.0, null, true, null,
                    studio, mainRoom
            ));
            Artwork greenHour = artworkRepository.save(new Artwork(
                    "Green Hour", 2026,
                    null, "A tranquil green landscape at dusk.",
                    "image", null, 1, -8.82, 2.18, -4.5, Math.PI / 2, null, null, null,
                    studio, mainRoom
            ));
            Artwork quietStreet = artworkRepository.save(new Artwork(
                    "Quiet Street", 2026,
                    null, "An empty street bathed in amber light.",
                    "image", null, 1, -8.82, 2.18, 3.1, Math.PI / 2, null, true, null,
                    studio, mainRoom
            ));
            Artwork blueRoom = artworkRepository.save(new Artwork(
                    "Blue Room", 2026,
                    null, "A deep blue interior with soft shadows.",
                    "image", null, 2, 8.82, 2.18, -3.8, -Math.PI / 2, null, true, null,
                    studio, mainRoom
            ));
            Artwork stoneLight = artworkRepository.save(new Artwork(
                    "Stone Light", 2026,
                    null, "Light playing across rough stone surfaces.",
                    "image", null, 2, 8.82, 2.18, 4.5, -Math.PI / 2, null, null, null,
                    studio, mainRoom
            ));
            Artwork exitGlow = artworkRepository.save(new Artwork(
                    "Exit Glow", 2026,
                    null, "A luminous exit sign in an otherwise dark corridor.",
                    "image", null, 3, 0, 2.18, 10.82, Math.PI, null, true, null,
                    studio, mainRoom
            ));

            Artwork portalToViolet = new Artwork(
                    "Violet Room Entrance", null,
                    null, "다음 전시실로 이동합니다.",
                    "portal", "3", 2, 8.72, 1.82, -6.6, -Math.PI / 2, null, null, null,
                    studio, mainRoom
            );
            portalToViolet.setPortalTargetX(-6.5);
            portalToViolet.setPortalTargetZ(6.4);
            portalToViolet.setPortalTargetYaw(-Math.PI / 2);
            artworkRepository.save(portalToViolet);

            Room violetRoom = roomRepository.save(new Room(
                    "Violet Gallery",
                    "A bright gallery with violet-tinted generative artworks.",
                    5.6,
                    "#d4cec4", "#a09888", "#cac4b8",
                    "#ffffff", 1.0
            ));

            Artwork violetPassage = artworkRepository.save(new Artwork(
                    "Violet Passage", 2026,
                    null, "Swirling violet gradients and deep indigo shadows.",
                    "image", null, 0, -4.9, 2.18, -10.82, 0.0, null, null, null,
                    studio, violetRoom
            ));
            Artwork afterimage = artworkRepository.save(new Artwork(
                    "Afterimage", 2026,
                    null, "A lingering trace of a bright moment.",
                    "image", null, 0, 0.2, 2.14, -10.82, 0.0, null, true, null,
                    studio, violetRoom
            ));
            Artwork glassGarden = artworkRepository.save(new Artwork(
                    "Glass Garden", 2026,
                    null, "Translucent forms that catch and bend the light.",
                    "image", null, 0, 5.2, 2.18, -10.82, 0.0, null, null, null,
                    studio, violetRoom
            ));
            Artwork signalLake = artworkRepository.save(new Artwork(
                    "Signal Lake", 2026,
                    null, "Rippling data streams resolved into a still surface.",
                    "image", null, 2, 8.82, 2.18, 2.2, -Math.PI / 2, null, true, null,
                    studio, violetRoom
            ));
            Artwork returnStudy = artworkRepository.save(new Artwork(
                    "Return Study", 2026,
                    null, "A quiet composition that invites a second look.",
                    "image", null, 1, -8.82, 2.18, -3.2, Math.PI / 2, null, null, null,
                    studio, violetRoom
            ));

            Artwork returnPortal = new Artwork(
                    "Return to Main Gallery", null,
                    null, "메인 갤러리로 돌아갑니다.",
                    "portal", "1", 1, -8.72, 1.82, 6.4, Math.PI / 2, null, null, null,
                    studio, violetRoom
            );
            returnPortal.setPortalTargetX(6.5);
            returnPortal.setPortalTargetZ(-6.6);
            returnPortal.setPortalTargetYaw(Math.PI / 2);
            artworkRepository.save(returnPortal);

            Artwork nebulaDream = artworkRepository.save(new Artwork(
                    "Nebula Dream", 2026,
                    null, "Swirling clouds of cosmic dust and gas.",
                    "image", null, 0, -4.0, 2.18, -10.82, 0.0, null, null, null,
                    cosmic, spaceRoom
            ));
            Artwork starField = artworkRepository.save(new Artwork(
                    "Star Field", 2026,
                    null, "Countless stars scattered across the void.",
                    "image", null, 1, -8.82, 2.18, -2.0, Math.PI / 2, null, true, null,
                    cosmic, spaceRoom
            ));
            Artwork darkPlanet = artworkRepository.save(new Artwork(
                    "Dark Planet", 2026,
                    null, "A lone planet orbiting a dying star.",
                    "image", null, 2, 8.82, 2.18, 1.5, -Math.PI / 2, null, true, null,
                    cosmic, spaceRoom
            ));
            Artwork cosmicHorizon = artworkRepository.save(new Artwork(
                    "Cosmic Horizon", 2026,
                    null, "The edge of the observable universe.",
                    "image", null, 3, 0, 2.18, 10.82, Math.PI, null, null, null,
                    cosmic, spaceRoom
            ));

            artworkKeywordRepository.saveAll(List.of(
                    new ArtworkKeyword("light", silentHorizon),
                    new ArtworkKeyword("stillness", silentHorizon),
                    new ArtworkKeyword("color", signalGarden),
                    new ArtworkKeyword("movement", signalGarden),
                    new ArtworkKeyword("green", greenHour),
                    new ArtworkKeyword("tranquil", greenHour),
                    new ArtworkKeyword("street", quietStreet),
                    new ArtworkKeyword("urban", quietStreet),
                    new ArtworkKeyword("blue", blueRoom),
                    new ArtworkKeyword("interior", blueRoom),
                    new ArtworkKeyword("stone", stoneLight),
                    new ArtworkKeyword("texture", stoneLight),
                    new ArtworkKeyword("glow", exitGlow),
                    new ArtworkKeyword("light", exitGlow),
                    new ArtworkKeyword("nebula", nebulaDream),
                    new ArtworkKeyword("cosmic", nebulaDream),
                    new ArtworkKeyword("star", starField),
                    new ArtworkKeyword("void", starField),
                    new ArtworkKeyword("planet", darkPlanet),
                    new ArtworkKeyword("dark", darkPlanet),
                    new ArtworkKeyword("horizon", cosmicHorizon),
                    new ArtworkKeyword("universe", cosmicHorizon),
                    new ArtworkKeyword("violet", violetPassage),
                    new ArtworkKeyword("gradient", violetPassage),
                    new ArtworkKeyword("trace", afterimage),
                    new ArtworkKeyword("light", afterimage),
                    new ArtworkKeyword("glass", glassGarden),
                    new ArtworkKeyword("translucent", glassGarden),
                    new ArtworkKeyword("signal", signalLake),
                    new ArtworkKeyword("data", signalLake),
                    new ArtworkKeyword("return", returnStudy),
                    new ArtworkKeyword("quiet", returnStudy)
            ));
        };
    }
}
