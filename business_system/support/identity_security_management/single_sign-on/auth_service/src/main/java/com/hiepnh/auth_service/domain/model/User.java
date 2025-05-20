package com.hiepnh.auth_service.domain.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class User {
    private UUID id;
    private String email;
    private String phone;
    private String fullName;
    private String status;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Credential credential;
    private UserProfile profile;
}