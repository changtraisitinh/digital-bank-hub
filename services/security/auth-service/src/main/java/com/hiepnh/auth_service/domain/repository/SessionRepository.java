package com.hiepnh.auth_service.domain.repository;

import com.hiepnh.auth_service.domain.model.Session;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository {
    Session save(Session session);
    Optional<Session> findByToken(String token);
    void deleteByToken(String token);
}