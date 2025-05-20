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
@Table(name = "credentials")
public class CredentialEntity {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "password_salt")
    private String passwordSalt;

    @Column(name = "last_changed")
    private LocalDateTime lastChanged;
}