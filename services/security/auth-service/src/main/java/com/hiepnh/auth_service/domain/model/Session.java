package com.hiepnh.auth_service.domain.model;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class Session {
    private UUID id;
    private UUID userId;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}