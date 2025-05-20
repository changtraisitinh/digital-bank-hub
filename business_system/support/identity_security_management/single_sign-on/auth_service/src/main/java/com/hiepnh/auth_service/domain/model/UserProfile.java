package com.hiepnh.auth_service.domain.model;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserProfile {
    private UUID userId;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String avatarUrl;
    private String nationality;
    private String occupation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}