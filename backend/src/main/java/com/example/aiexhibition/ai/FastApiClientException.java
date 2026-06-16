package com.example.aiexhibition.ai;

/**
 * FastAPI 호출 중 생긴 문제를 AI 실패 사유와 함께 Service 계층으로 전달하는 예외다.
 */
public class FastApiClientException extends RuntimeException {

    // 문자열 오류값 대신 enum을 들고 있어 Service가 안정적으로 분기할 수 있다.
    private final AiFailureReason reason;

    // 원인 예외가 따로 없고 실패 사유와 메시지만 전달할 때 사용한다.
    public FastApiClientException(AiFailureReason reason, String message) {
        super(message);
        this.reason = reason == null ? AiFailureReason.UNKNOWN : reason;
    }

    // WebClient/타임아웃처럼 원본 예외도 같이 보존해야 할 때 사용한다.
    public FastApiClientException(
            AiFailureReason reason,
            String message,
            Throwable cause
    ) {
        super(message, cause);
        this.reason = reason == null ? AiFailureReason.UNKNOWN : reason;
    }

    // Service가 fallback 여부를 판단할 수 있게 실패 사유를 꺼내준다.
    public AiFailureReason getReason() {
        return reason;
    }
}
