package com.example.aiexhibition.hall;

import com.example.aiexhibition.hall.dto.HallResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class HallService {

    private final HallRepository hallRepository;

    public HallService(HallRepository hallRepository) {
        this.hallRepository = hallRepository;
    }

    public List<HallResponse> findAll() {
        return hallRepository.findAll().stream()
                .map(HallResponse::from)
                .toList();
    }
}

