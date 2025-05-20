# MFA Go Service

## Overview
This project implements a Multi-Factor Authentication (MFA) service using Go. It includes features such as JWT-based authentication, OTP generation and verification, rate limiting, and secure secret storage.

## Prerequisites
- Go 1.16+
- PostgreSQL
- Redis
- Docker (optional, for containerization)

## Setup

### Environment Variables
Create a `.env` file in the root of your project directory with the following content:

```env
DATABASE_URL="user=postgres dbname=auth sslmode=disable"
ISSUER="ExampleApp"


# TESTING

## Login to get JWT
curl "http://localhost:8000/login?email=test@example.com"

## Generate an OTP using JWT
JWT_TOKEN="your_jwt_token_here"
curl -H "Authorization: $JWT_TOKEN" "http://localhost:8000/generate?email=test@example.com"

## Generate OTP using the command-line tool
go run generate_otp.go -secret=3HVNB7KS2E6C62XARVSU7P3R35P6NCZW -email=test@example.com

## Verify the OTP using JWT
JWT_TOKEN="your_jwt_token_here"
OTP="your_generated_otp_here"
curl -H "Authorization: $JWT_TOKEN" "http://localhost:8000/verify?email=test@example.com&otp=$OTP"