package com.hiepnh.auth_service.domain.repository;

import com.hiepnh.auth_service.domain.model.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    User save(User user);
    Optional<User> findById(UUID id);
}