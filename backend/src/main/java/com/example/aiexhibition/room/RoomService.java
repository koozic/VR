package com.example.aiexhibition.room;

import com.example.aiexhibition.artwork.ArtworkRepository;
import com.example.aiexhibition.artwork.dto.ArtworkResponse;
import com.example.aiexhibition.room.dto.RoomResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final ArtworkRepository artworkRepository;

    public RoomService(RoomRepository roomRepository, ArtworkRepository artworkRepository) {
        this.roomRepository = roomRepository;
        this.artworkRepository = artworkRepository;
    }

    public List<RoomResponse> findAll() {
        return roomRepository.findAll().stream()
                .map(room -> RoomResponse.from(room, List.of()))
                .toList();
    }

    public RoomResponse findById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));
        List<ArtworkResponse> exhibits = artworkRepository.findByRoomId(id).stream()
                .map(ArtworkResponse::from)
                .toList();
        return RoomResponse.from(room, exhibits);
    }
}
