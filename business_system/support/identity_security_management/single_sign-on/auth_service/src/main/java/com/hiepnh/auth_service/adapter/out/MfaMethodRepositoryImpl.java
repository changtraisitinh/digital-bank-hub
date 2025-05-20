package com.hiepnh.auth_service.adapter.out;

import com.hiepnh.auth_service.domain.model.MfaMethod;
import com.hiepnh.auth_service.domain.repository.MfaMethodRepository;
import com.hiepnh.auth_service.infrastructure.persistence.entity.MfaMethodEntity;
import com.hiepnh.auth_service.infrastructure.persistence.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class MfaMethodRepositoryImpl implements MfaMethodRepository {
    private final MfaMethodJpaRepository jpaRepository;
    private final EntityMapper mapper;

    @Override
    public MfaMethod save(MfaMethod mfaMethod) {
        MfaMethodEntity entity = mapper.toMfaMethodEntity(mfaMethod);
        return mapper.toMfaMethod(jpaRepository.save(entity));
    }

    @Override
    public Optional<MfaMethod> findByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndEnabled(userId, true)
                .map(mapper::toMfaMethod);
    }
}

@Repository
interface MfaMethodJpaRepository extends JpaRepository<MfaMethodEntity, UUID> {
    Optional<MfaMethodEntity> findByUserIdAndEnabled(UUID userId, boolean enabled);
}