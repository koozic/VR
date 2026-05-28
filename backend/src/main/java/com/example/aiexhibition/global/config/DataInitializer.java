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
                    "A quiet virtual room for AI-curated artworks."
            ));
            Artist studio = artistRepository.save(new Artist(
                    "AI Exhibition Studio",
                    "A digital studio exploring generated narratives and spatial exhibitions."
            ));

            Artwork silentHorizon = artworkRepository.save(new Artwork(
                    "Silent Horizon",
                    2026,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
                    "A calm study of light, depth, and stillness inside a virtual room.",
                    studio,
                    mainRoom
            ));
            Artwork signalGarden = artworkRepository.save(new Artwork(
                    "Signal Garden",
                    2026,
                    "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
                    "Layered color fields that respond to the visitor path through the gallery.",
                    studio,
                    mainRoom
            ));

            artworkKeywordRepository.saveAll(List.of(
                    new ArtworkKeyword("light", silentHorizon),
                    new ArtworkKeyword("stillness", silentHorizon),
                    new ArtworkKeyword("color", signalGarden),
                    new ArtworkKeyword("movement", signalGarden)
            ));
        };
    }
}

