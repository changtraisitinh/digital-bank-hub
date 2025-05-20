package com.hiepnh.auth_service.domain.repository;

import com.hiepnh.auth_service.domain.model.MfaMethod;
import java.util.Optional;
import java.util.UUID;

public interface MfaMethodRepository {
    MfaMethod save(MfaMethod mfaMethod);
    Optional<MfaMethod> findByUserId(UUID userId);
}