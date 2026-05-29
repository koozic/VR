package com.example.aiexhibition.room;

import com.example.aiexhibition.artwork.dto.ArtworkResponse;
import com.example.aiexhibition.room.dto.RoomResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final ArtworkService artworkService;

    public RoomController(RoomService roomService, ArtworkService artworkService) {
        this.roomService = roomService;
        this.artworkService = artworkService;
    }

    @GetMapping
    public List<RoomResponse> findAll() {
        return roomService.findAll();
    }

    @GetMapping("/{id}")
    public RoomResponse findById(@PathVariable Long id) {
        return roomService.findById(id);
    }

    @GetMapping("/{roomId}/exhibits")
    public List<ArtworkResponse> findExhibitsByRoom(@PathVariable Long roomId) {
        return artworkService.findByRoomId(roomId);
    }
}
