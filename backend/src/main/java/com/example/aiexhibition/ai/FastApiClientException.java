package com.example.aiexhibition.ai;

public class FastApiClientException extends RuntimeException {

    private final AiFailureReason reason;

    public FastApiClientException(AiFailureReason reason, String message) {
        super(message);
        this.reason = reason == null ? AiFailureReason.UNKNOWN : reason;
    }

    public FastApiClientException(
            AiFailureReason reason,
            String message,
            Throwable cause
    ) {
        super(message, cause);
        this.reason = reason == null ? AiFailureReason.UNKNOWN : reason;
    }

    public AiFailureReason getReason() {
        return reason;
    }
}
