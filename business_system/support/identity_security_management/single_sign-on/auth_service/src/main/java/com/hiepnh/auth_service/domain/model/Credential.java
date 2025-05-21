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


    public static class CredentialBuilder {
        private String passwordHash;
        private String resetToken;
        private LocalDateTime resetTokenExpiryTime;

        CredentialBuilder() {}

        public CredentialBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public CredentialBuilder resetToken(String resetToken) {
            this.resetToken = resetToken;
            return this;
        }

        public CredentialBuilder resetTokenExpiryTime(LocalDateTime resetTokenExpiryTime) {
            this.resetTokenExpiryTime = resetTokenExpiryTime;
            return this;
        }

        public Credential build() {
            return new Credential(passwordHash, resetToken, resetTokenExpiryTime);
        }
    }
}