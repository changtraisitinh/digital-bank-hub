package http

import (
	"github.com/gin-gonic/gin"
	"notification_service/internal/app/handler"
	"notification_service/internal/app/service"
	"notification_service/pkg/logger"
)

func NewRouter(notificationService *service.NotificationService, logger *logger.Logger) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())

	// Initialize handlers
	notificationHandler := handler.NewNotificationHandler(notificationService, logger)

	// API routes
	v1 := router.Group("/api/v1")
	{
		notifications := v1.Group("/notifications")
		{
			notifications.POST("/", notificationHandler.Create)
			notifications.GET("/:id", notificationHandler.Get)
			notifications.GET("/", notificationHandler.List)
			notifications.PATCH("/:id/status", notificationHandler.UpdateStatus)
		}
	}

	return router
}
