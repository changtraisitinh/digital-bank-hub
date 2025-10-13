# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=dibank-notification-service

# Main entry point
MAIN_PATH=cmd/api/main.go

# Docker parameters
DOCKER_COMPOSE=docker-compose

.PHONY: all build clean run test deps tidy docker-up docker-down

all: clean deps build

build:
	$(GOBUILD) -o $(BINARY_NAME) $(MAIN_PATH)

clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

run:
	$(GORUN) $(MAIN_PATH)

test:
	$(GOTEST) -v ./...

deps:
	$(GOGET) github.com/gin-gonic/gin
	$(GOGET) github.com/go-playground/validator/v10
	$(GOGET) github.com/spf13/viper
	$(GOGET) github.com/Shopify/sarama
	$(GOGET) github.com/lib/pq
	$(GOGET) github.com/sirupsen/logrus
	$(GOGET) go.uber.org/zap
	$(GOGET) github.