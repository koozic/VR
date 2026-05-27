package com.example.aiexhibition.room;

import com.example.aiexhibition.room.dto.RoomResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomResponse> findAll() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::from)
                .toList();
    }
}

