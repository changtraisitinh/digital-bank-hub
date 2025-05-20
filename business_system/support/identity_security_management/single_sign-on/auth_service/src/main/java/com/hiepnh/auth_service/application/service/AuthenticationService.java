package com.hiepnh.auth_service.application.service;

import com.hiepnh.auth_service.application.dto.request.*;
import com.hiepnh.auth_service.application.dto.response.AuthResponse;
import com.hiepnh.auth_service.domain.model.User;
import com.hiepnh.auth_service.domain.repository.UserRepository;
import com.hiepnh.auth_service.domain.repository.SessionRepository;
import com.hiepnh.auth_service.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final MfaService mfaService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify password and generate tokens
        if (!passwordEncoder.matches(request.getPassword(), user.getCredential().getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (mfaService.isMfaEnabled(user.getId())) {
            return AuthResponse.builder()
                    .mfaRequired(true)
                    .mfaToken(mfaService.generateMfaToken(user))
                    .build();
        }

        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Transactional
    public void logout(String token) {
        String actualToken = token.substring(7); // Remove "Bearer "
        sessionRepository.deleteByToken(actualToken);
    }

    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String userEmail = jwtTokenProvider.extractUsername(request.getRefreshToken());
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (jwtTokenProvider.isTokenValid(request.getRefreshToken(), user)) {
            String accessToken = jwtTokenProvider.generateToken(user);
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(request.getRefreshToken())
                    .tokenType("Bearer")
                    .build();
        }

        throw new RuntimeException("Invalid refresh token");
    }

    @Transactional
    public AuthResponse verifyMfa(MfaVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

//        if (!mfaService.verifyMfaCode(user.getId(), request.getMfaToken(), request.getCode())) {
//            throw new RuntimeException("Invalid MFA code");
//        }

        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Transactional
    public void initiatePasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        // Set expiration time to 15 minutes from now
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        user.getCredential().setResetToken(resetToken);
        user.getCredential().setResetTokenExpiryTime(expiryTime);
        userRepository.save(user);

        // Send password reset email with token (implement email service separately)
        // emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public void updatePassword(PasswordUpdateRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify reset token and expiration
        if (user.getCredential().getResetToken() == null ||
                !user.getCredential().getResetToken().equals(request.getResetToken()) ||
                user.getCredential().getResetTokenExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        // Update password
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.getCredential().setPassword(encodedPassword);

        // Clear reset token
        user.getCredential().setResetToken(null);
        user.getCredential().setResetTokenExpiryTime(null);

        userRepository.save(user);
    }
}