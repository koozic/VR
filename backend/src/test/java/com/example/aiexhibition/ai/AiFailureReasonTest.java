package com.example.aiexhibition.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AiFailureReasonTest {

    @Test
    void mapsFastApiErrorCode() {
        assertThat(AiFailureReason.fromExternalCode("GEMINI_QUOTA_EXHAUSTED"))
                .isEqualTo(AiFailureReason.GEMINI_QUOTA_EXHAUSTED);
    }

    @Test
    void normalizesWhitespaceAndLetterCase() {
        assertThat(AiFailureReason.fromExternalCode("  gemini_auth_failed  "))
                .isEqualTo(AiFailureReason.GEMINI_AUTH_FAILED);
    }

    @Test
    void mapsMissingOrUnknownCodeToUnknown() {
        assertThat(AiFailureReason.fromExternalCode(null))
                .isEqualTo(AiFailureReason.UNKNOWN);
        assertThat(AiFailureReason.fromExternalCode(" "))
                .isEqualTo(AiFailureReason.UNKNOWN);
        assertThat(AiFailureReason.fromExternalCode("NEW_PROVIDER_ERROR"))
                .isEqualTo(AiFailureReason.UNKNOWN);
    }
}
