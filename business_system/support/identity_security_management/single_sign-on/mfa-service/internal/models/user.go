package models

import (
	"github.com/dgrijalva/jwt-go"
	"time"
)

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

type LoginResponse struct {
	Token string `json:"token"`
	Email string `json:"email"`
}

type OTPResponse struct {
	Message string `json:"message"`
	Email   string `json:"email"`
	Status  bool   `json:"status"`
}

type OTPVerificationResponse struct {
	Message     string    `json:"message"`
	Email       string    `json:"email"`
	Valid       bool      `json:"valid"`
	VerifiedAt  time.Time `json:"verified_at"`
	GeneratedAt time.Time `json:"generated_at"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}
