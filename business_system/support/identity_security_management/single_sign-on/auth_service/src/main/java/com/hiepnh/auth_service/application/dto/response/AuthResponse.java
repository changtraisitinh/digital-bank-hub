package com.hiepnh.auth_service.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private boolean mfaRequired;
    private String mfaToken;
    private int status;
}