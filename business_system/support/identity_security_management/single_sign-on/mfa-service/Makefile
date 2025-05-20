.PHONY: build run test docker

build:
	go build -o bin/mfa-service cmd/api/main.go

run:
	go run cmd/api/main.go

test:
	go test ./...

docker:
	docker build -t mfa-service .

lint:
	golangci-lint run

generate-docs:
	swag init -g cmd/api/main.go