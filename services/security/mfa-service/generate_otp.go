package main

import (
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/pquerna/otp/totp"
)

var jwtKey = []byte("my_secret_key")

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

func generateJWT(email string) (string, error) {
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func main() {
	// Define a command-line flag for the secret
	secret := flag.String("secret", "", "The TOTP secret")
	email := flag.String("email", "", "The user's email")
	flag.Parse()

	// Check if the secret and email are provided
	if *secret == "" || *email == "" {
		log.Fatal("Secret and email are required")
	}

	// Generate the OTP
	otp, err := totp.GenerateCode(*secret, time.Now())
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated OTP:", otp)

	// Generate JWT
	token, err := generateJWT(*email)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated JWT:", token)
}
