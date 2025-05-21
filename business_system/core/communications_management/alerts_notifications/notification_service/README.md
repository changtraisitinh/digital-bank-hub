notification-service/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── app/
│   │   ├── handler/
│   │   │   └── notification_handler.go
│   │   └── service/
│   │       └── notification_service.go
│   ├── domain/
│   │   ├── entity/
│   │   │   └── notification.go
│   │   └── repository/
│   │       └── notification_repository.go
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── persistence/
│   │   │   └── postgres/
│   │   │       └── notification_repository.go
│   │   └── messaging/
│   │       ├── kafka/
│   │       │   └── producer.go
│   │       └── email/
│   │           └── sender.go
│   └── ports/
│       ├── http/
│       │   └── router.go
│       └── kafka/
│           └── consumer.go
├── pkg/
│   ├── logger/
│   │   └── logger.go
│   └── validator/
│       └── validator.go
├── configs/
│   └── config.yaml
├── deployments/
│   └── docker-compose.yml
├── api/
│   └── swagger/
│       └── api.yaml
├── Makefile
├── Dockerfile
└── go.mod