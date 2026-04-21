# syntax=docker/dockerfile:1

FROM golang:1.22-alpine3.19 AS builder

# Configure Go to use direct downloads and Google's DNS
ENV GOPROXY=direct \
    GOSUMDB=off
# Update package index and install required packages
RUN apk update --no-cache && apk add --no-cache git gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o dibank_notification_service ./cmd/api

FROM alpine:3.19
WORKDIR /root/
COPY --from=builder /app/dibank_notification_service .
COPY configs/config.yaml ./configs/config.yaml
EXPOSE 8080
CMD ["./dibank_notification_service", "-config", "./configs/config.yaml"]

