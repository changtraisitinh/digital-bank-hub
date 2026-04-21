package com.hiepnh.auth_service.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MfaEnrollRequest {
    @NotBlank
    private String userId;

    @NotBlank
    private String method;
}