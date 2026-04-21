package com.hiepnh.auth_service.domain.model;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MfaMethod {
    private UUID id;
    private UUID userId;
    private String method;
    private String secret;
    private boolean enabled;
    private LocalDateTime createdAt;
}