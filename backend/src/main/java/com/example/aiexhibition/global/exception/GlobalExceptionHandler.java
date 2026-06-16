package com.example.aiexhibition.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * 컨트롤러에서 발생한 예외를 한곳에서 잡아 프런트엔드가 이해하기 쉬운 JSON으로 바꾼다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Service에서 "요청 값이 잘못됐다"고 판단한 예외를 400 Bad Request로 변환한다.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
        // 존재하지 않는 작품/전시관처럼 요청 값에서 생긴 업무 오류는 400으로 반환한다.
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    // @Valid 검증 실패를 400 Bad Request와 message JSON으로 변환한다.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        // 필드 하나의 오류뿐 아니라 여러 필드의 조합을 검사한 객체 오류도 함께 처리한다.
        String message = exception.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(GlobalExceptionHandler::validationMessage)
                .orElse("Invalid request");

        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    // 필드 오류와 record 전체 검증 오류를 사람이 읽기 좋은 문장으로 정리한다.
    private static String validationMessage(ObjectError error) {
        if (error instanceof FieldError fieldError) {
            if ("AssertTrue".equals(fieldError.getCode())) {
                return fieldError.getDefaultMessage() == null
                        ? "Invalid request"
                        : fieldError.getDefaultMessage();
            }
            return fieldError.getField() + ": " + fieldError.getDefaultMessage();
        }
        return error.getDefaultMessage() == null
                ? "Invalid request"
                : error.getDefaultMessage();
    }

    // 마지막 안전망이다. 예상 밖 예외는 500으로 보내되 내부 상세 정보는 숨긴다.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception exception) {
        // 예상하지 못한 내부 예외의 상세 내용은 외부에 노출하지 않는다.
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Internal server error"));
    }
}

