package com.hiepnh.auth_service.infrastructure.exception;

import com.hiepnh.auth_service.application.dto.response.ErrorResponse;
import com.hiepnh.auth_service.domain.exception.AuthenticationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error(ex.getError())
                .message(ex.getMessage())
                .status(ex.getStatus())
                .build();

        return ResponseEntity.status(ex.getStatus())
                .body(errorResponse);
    }
}
