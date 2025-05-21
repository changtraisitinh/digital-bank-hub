package com.hiepnh.auth_service.domain.model;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class User {
    private UUID id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String status;
    private Long version;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    private Credential credential;
    private UserProfile profile;
}