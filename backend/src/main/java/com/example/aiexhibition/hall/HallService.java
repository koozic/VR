package com.example.aiexhibition.hall;

import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.dto.HallResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class HallService {

    private final HallRepository hallRepository;
    private final ExhibitRepository exhibitRepository;

    public HallService(HallRepository hallRepository, ExhibitRepository exhibitRepository) {
        this.hallRepository = hallRepository;
        this.exhibitRepository = exhibitRepository;
    }

    public List<HallResponse> findAll() {
        return hallRepository.findAll().stream()
                .map(HallResponse::from)
                .toList();
    }

    public HallResponse findById(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + id));
        List<ExhibitResponse> exhibits = exhibitRepository.findByHallId(id).stream()
                .map(ExhibitResponse::from)
                .toList();
        return HallResponse.from(hall, exhibits);
    }
}

