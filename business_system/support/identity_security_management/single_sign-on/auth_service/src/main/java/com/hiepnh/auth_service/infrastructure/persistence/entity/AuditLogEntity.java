package com.hiepnh.auth_service.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "audit_logs")
public class AuditLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String action;
    private LocalDateTime timestamp;
    private String details;
}