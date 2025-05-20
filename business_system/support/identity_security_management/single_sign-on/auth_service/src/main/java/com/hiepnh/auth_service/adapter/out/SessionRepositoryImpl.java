package com.hiepnh.auth_service.adapter.out;

import com.hiepnh.auth_service.domain.model.Session;
import com.hiepnh.auth_service.domain.repository.SessionRepository;
import com.hiepnh.auth_service.infrastructure.persistence.entity.SessionEntity;
import com.hiepnh.auth_service.infrastructure.persistence.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SessionRepositoryImpl implements SessionRepository {
    private final SessionJpaRepository jpaRepository;
    private final EntityMapper mapper;

    @Override
    public Session save(Session session) {
        SessionEntity entity = mapper.toSessionEntity(session);
        return mapper.toSession(jpaRepository.save(entity));
    }

    @Override
    public Optional<Session> findByToken(String token) {
        return jpaRepository.findByToken(token)
                .map(mapper::toSession);
    }

    @Override
    public void deleteByToken(String token) {
        jpaRepository.deleteByToken(token);
    }
}

@Repository
interface SessionJpaRepository extends JpaRepository<SessionEntity, UUID> {
    Optional<SessionEntity> findByToken(String token);
    void deleteByToken(String token);
}