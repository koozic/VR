package com.example.aiexhibition.hall;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class HallServiceTest {

    @Test
    void findsOnlyExhibitsForHallWithoutBuildingHallDetailResponse() {
        TestContext context = new TestContext();
        Hall hall = hallWithId(3L);
        Exhibit exhibit = exhibitWithId(
                9L,
                new Exhibit("Starry Night", "Vincent van Gogh", "Blue night sky", hall)
        );

        when(context.hallRepository.existsById(3L)).thenReturn(true);
        when(context.exhibitRepository.findByHallId(3L)).thenReturn(List.of(exhibit));
        when(context.exhibitKeywordService.findKeywordsByExhibitIds(List.of(9L)))
                .thenReturn(Map.of(9L, List.of("night", "stars")));

        List<ExhibitResponse> responses = context.hallService.findExhibitsByHallId(3L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).id()).isEqualTo(9L);
        assertThat(responses.get(0).title()).isEqualTo("Starry Night");
        assertThat(responses.get(0).hallId()).isEqualTo(3L);
        assertThat(responses.get(0).keywords()).containsExactly("night", "stars");
        verify(context.hallRepository, never()).findById(3L);
        verify(context.exhibitRepository).findByHallId(3L);
    }

    @Test
    void rejectsMissingHallBeforeLookingUpExhibits() {
        TestContext context = new TestContext();
        when(context.hallRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> context.hallService.findExhibitsByHallId(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Hall not found: 99");

        verify(context.exhibitRepository, never()).findByHallId(99L);
    }

    private static Hall hallWithId(Long id) {
        Hall hall = new Hall("Main Gallery", "Main hall");
        ReflectionTestUtils.setField(hall, "id", id);
        return hall;
    }

    private static Exhibit exhibitWithId(Long id, Exhibit exhibit) {
        ReflectionTestUtils.setField(exhibit, "id", id);
        return exhibit;
    }

    private static class TestContext {
        private final HallRepository hallRepository = mock(HallRepository.class);
        private final ExhibitRepository exhibitRepository = mock(ExhibitRepository.class);
        private final ExhibitKeywordService exhibitKeywordService = mock(ExhibitKeywordService.class);
        private final HallService hallService = new HallService(
                hallRepository,
                exhibitRepository,
                exhibitKeywordService
        );
    }
}
