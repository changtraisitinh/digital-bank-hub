package services

import (
	"database/sql"
	"github.com/pquerna/otp/totp"
	"github.com/sirupsen/logrus"
	"time"
)

type OTPService struct {
	db     *sql.DB
	logger *logrus.Logger
	issuer string
}

func NewOTPService(db *sql.DB, logger *logrus.Logger, issuer string) *OTPService {
	if issuer == "" {
		issuer = "MFA"
	}
	return &OTPService{
		db:     db,
		logger: logger,
		issuer: issuer,
	}
}

func (s *OTPService) GenerateOTP(email string) (string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      s.issuer,
		AccountName: email,
	})
	if err != nil {
		return "", err
	}

	secret := key.Secret()
	_, err = s.db.Exec(
		"INSERT INTO users (email, secret, otp_generated_at) VALUES ($1, $2, $3) "+
			"ON CONFLICT (email) DO UPDATE SET secret = $2, otp_generated_at = $3",
		email, secret, time.Now(),
	)
	return secret, err
}

func (s *OTPService) VerifyOTP(email, otp string) (bool, time.Time, time.Time, error) {
	var secret string
	var otpGeneratedAt time.Time

	err := s.db.QueryRow(
		"SELECT secret, otp_generated_at FROM users WHERE email = $1",
		email,
	).Scan(&secret, &otpGeneratedAt)
	if err != nil {
		return false, time.Time{}, time.Time{}, err
	}

	if time.Since(otpGeneratedAt) > 5*time.Minute {
		return false, time.Time{}, otpGeneratedAt, nil
	}

	valid := totp.Validate(otp, secret)
	return valid, time.Now(), otpGeneratedAt, nil
}

// GetIssuer returns the issuer name used for OTP generation
func (s *OTPService) GetIssuer() string {
	return s.issuer
}
