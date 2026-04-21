package com.hiepnh.auth_service.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String mfaToken;

    @NotBlank
    private String code;
}