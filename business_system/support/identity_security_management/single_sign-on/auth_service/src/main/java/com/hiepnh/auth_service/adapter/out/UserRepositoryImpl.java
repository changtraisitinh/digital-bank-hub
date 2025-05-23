package com.hiepnh.auth_service.adapter.out;

import com.hiepnh.auth_service.domain.model.User;
import com.hiepnh.auth_service.domain.repository.UserRepository;
import com.hiepnh.auth_service.infrastructure.persistence.entity.UserEntity;
import com.hiepnh.auth_service.infrastructure.persistence.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository jpaRepository;
    private final EntityMapper mapper;

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email)
                .map(mapper::toUser);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return jpaRepository.findByUsername(username)
                .map(mapper::toUser);
    }

    @Override
    @Transactional
    public User save(User user) {
        UserEntity entity = mapper.toUserEntity(user);
        if (user.getId() != null) {
            // Existing entity - fetch to preserve version
            UserEntity existing = jpaRepository.findById(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("User with ID " + user.getId() + " not found"));
            // Update fields from the input user
            existing.setUsername(user.getUsername());
            existing.setEmail(user.getEmail());
            existing.setPhone(user.getPhone());
            existing.setFullName(user.getFullName());
            existing.setStatus(user.getStatus());
            existing.setUpdatedAt(LocalDateTime.now());

            // Handle credential update
            if (user.getCredential() != null) {
                if (existing.getCredential() == null) {
                    existing.setCredential(mapper.toCredentialEntity(user.getCredential()));
                    existing.getCredential().setUser(existing);
                } else {
                    existing.getCredential().setPasswordHash(user.getCredential().getPasswordHash());
                }
            }

            // Do NOT set version manually
            entity = existing;
        } else {
            // For new user, ensure credential is properly set
            if (user.getCredential() != null) {
                entity.setCredential(mapper.toCredentialEntity(user.getCredential()));
                entity.getCredential().setUser(entity);
            }
        }
        entity = jpaRepository.save(entity);
        return mapper.toUser(entity);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toUser);
    }
}

@Repository
interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByUsername(String username);
}