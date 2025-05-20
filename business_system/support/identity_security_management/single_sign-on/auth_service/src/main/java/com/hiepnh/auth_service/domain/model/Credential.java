package com.hiepnh.auth_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Credential {
    private String passwordHash;
    private String resetToken;
    private LocalDateTime resetTokenExpiryTime;

    public void setPassword(String encodedPassword) {
        this.passwordHash = encodedPassword;
    }
}