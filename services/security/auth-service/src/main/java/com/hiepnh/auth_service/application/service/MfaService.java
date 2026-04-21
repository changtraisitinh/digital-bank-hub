package com.hiepnh.auth_service.application.service;

import com.hiepnh.auth_service.application.dto.request.MfaEnrollRequest;
import com.hiepnh.auth_service.application.dto.request.MfaVerifyRequest;
import com.hiepnh.auth_service.domain.model.MfaMethod;
import com.hiepnh.auth_service.domain.model.User;
import com.hiepnh.auth_service.domain.repository.MfaMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaService {
    private final MfaMethodRepository mfaMethodRepository;

    public boolean isMfaEnabled(UUID userId) {
        return mfaMethodRepository.findByUserId(userId).isPresent();
    }

    @Transactional
    public String generateMfaToken(User user) {
        // Implementation for generating MFA token
        return "mfa-" + UUID.randomUUID().toString();
    }

    @Transactional
    public void enrollMfa(MfaEnrollRequest request) {
        MfaMethod mfaMethod = MfaMethod.builder()
                .id(UUID.randomUUID())
                .userId(UUID.fromString(request.getUserId()))
                .method(request.getMethod())
                .secret(generateSecret())
                .enabled(true)
                .build();

        mfaMethodRepository.save(mfaMethod);
    }

    private String generateSecret() {
        // Implementation for generating MFA secret
        return UUID.randomUUID().toString();
    }
}