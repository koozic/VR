package com.example.aiexhibition.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
        // 존재하지 않는 작품/전시관처럼 요청 값에서 생긴 업무 오류는 400으로 반환한다.
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        // 필드 하나의 오류뿐 아니라 여러 필드의 조합을 검사한 객체 오류도 함께 처리한다.
        String message = exception.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(GlobalExceptionHandler::validationMessage)
                .orElse("Invalid request");

        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception exception) {
        // 예상하지 못한 내부 예외의 상세 내용은 외부에 노출하지 않는다.
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Internal server error"));
    }
}

