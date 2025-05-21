package main

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"notification_service/internal/app/service"
	"notification_service/internal/infrastructure/config"
	"notification_service/internal/infrastructure/persistence/postgres"
	"notification_service/internal/ports/http"
	"notification_service/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize logger
	logger, err := logger.NewLogger()
	if err != nil {
		log.Fatalf("Failed to create logger: %v", err)
	}

	// Connect to database
	dbURL := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		logger.Fatalw("Failed to connect to database", "error", err)
	}
	defer db.Close()

	// Initialize repositories
	notificationRepo := postgres.NewNotificationRepository(db)

	// Initialize services
	notificationService := service.NewNotificationService(notificationRepo, logger)

	// Initialize and start HTTP server
	router := http.NewRouter(notificationService, logger)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		logger.Fatalw("Failed to start server", "error", err)
	}
}
