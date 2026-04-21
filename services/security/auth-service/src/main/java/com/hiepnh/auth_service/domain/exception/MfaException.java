package com.hiepnh.auth_service.domain.exception;

public class MfaException extends RuntimeException {
    public MfaException(String message) {
        super(message);
    }

    public MfaException(String message, Throwable cause) {
        super(message, cause);
    }
}