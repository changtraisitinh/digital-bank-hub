package com.hiepnh.auth_service.domain.exception;

import lombok.Getter;

@Getter
public class AuthenticationException extends RuntimeException {
    private final String error;
    private final int status;

    public AuthenticationException(String message, String error, int status) {
        super(message);
        this.error = error;
        this.status = status;
    }
}
