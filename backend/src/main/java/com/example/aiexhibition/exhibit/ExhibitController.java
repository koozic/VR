package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.exhibit.dto.ExhibitCreateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitPositionUpdateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.exhibit.dto.ExhibitUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/exhibits", "/api/artworks"})
public class ExhibitController {

    // /api/exhibits와 이전 호환 주소 /api/artworks가 같은 기능을 사용한다.
    private final ExhibitService exhibitService;

    public ExhibitController(ExhibitService exhibitService) {
        this.exhibitService = exhibitService;
    }

    @GetMapping
    public List<ExhibitResponse> findAll() {
        // 전체 작품 목록을 조회한다. 갤러리 초기 화면이나 관리자 화면에서 사용할 수 있다.
        return exhibitService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExhibitResponse create(@Valid @RequestBody ExhibitCreateRequest request) {
        // 작품 본문, 전시관, 3D 위치를 함께 받아 새 작품을 만든다.
        return exhibitService.create(request);
    }

    @PutMapping("/{id}")
    public ExhibitResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ExhibitUpdateRequest request
    ) {
        // 작품의 설명/표시 설정/소속 전시관/위치를 한 번에 수정한다.
        return exhibitService.update(id, request);
    }

    @PatchMapping("/{id}/position")
    public ExhibitResponse updatePosition(
            @PathVariable Long id,
            @Valid @RequestBody ExhibitPositionUpdateRequest request
    ) {
        // 작품의 3D 위치만 따로 수정할 때 사용하는 부분 수정 API다.
        return exhibitService.updatePosition(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        // 작품 ID로 작품을 삭제한다.
        exhibitService.delete(id);
    }

    @GetMapping("/nearest")
    public ExhibitResponse findNearest(
            @RequestParam Double x,
            @RequestParam Double y,
            @RequestParam Double z,
            @RequestParam(required = false) Long hallId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Double maxDistance
    ) {
        // hallId가 없고 이전 이름인 roomId가 오면 동일한 전시관 ID로 취급한다.
        Long effectiveHallId = hallId != null ? hallId : roomId;
        // 관람객 좌표를 기준으로 가장 가까운 작품을 찾아 AI 도슨트 대상 후보로 사용한다.
        return exhibitService.findNearest(x, y, z, effectiveHallId, maxDistance);
    }

    @GetMapping("/{id}")
    public ExhibitResponse findById(@PathVariable Long id) {
        // 작품 ID로 상세 정보를 조회한다.
        return exhibitService.findById(id);
    }
}

