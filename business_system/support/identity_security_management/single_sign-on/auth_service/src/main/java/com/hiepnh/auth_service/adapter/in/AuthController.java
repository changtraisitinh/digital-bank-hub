package com.hiepnh.auth_service.adapter.in;

import com.hiepnh.auth_service.application.dto.request.*;
import com.hiepnh.auth_service.application.dto.response.AuthResponse;
import com.hiepnh.auth_service.application.dto.response.MfaEnrollResponse;
import com.hiepnh.auth_service.application.service.AuthenticationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authenticationService.logout(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authenticationService.refreshToken(request));
    }

//    @PostMapping("/mfa/enroll")
//    public ResponseEntity<MfaEnrollResponse> enrollMfa(@Valid @RequestBody MfaEnrollRequest request) {
//        return ResponseEntity.ok(authenticationService.enrollMfa(request));
//    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<AuthResponse> verifyMfa(@Valid @RequestBody MfaVerifyRequest request) {
        return ResponseEntity.ok(authenticationService.verifyMfa(request));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authenticationService.initiatePasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password-update")
    public ResponseEntity<Void> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        authenticationService.updatePassword(request);
        return ResponseEntity.ok().build();
    }
}