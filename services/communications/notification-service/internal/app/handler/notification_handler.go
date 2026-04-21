package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"notification_service/internal/app/service"
	"notification_service/internal/domain/entity"
	"notification_service/pkg/logger"
)

type NotificationHandler struct {
	service *service.NotificationService
	logger  *logger.Logger
}

type CreateNotificationRequest struct {
	Type      entity.NotificationType `json:"type" binding:"required,oneof=EMAIL SMS PUSH"`
	Recipient string                  `json:"recipient" binding:"required,email"`
	Subject   string                  `json:"subject" binding:"required"`
	Content   string                  `json:"content" binding:"required"`
	Priority  string                  `json:"priority" binding:"required,oneof=HIGH MEDIUM LOW"`
	Metadata  map[string]interface{}  `json:"metadata,omitempty"`
}
type UpdateNotificationStatusRequest struct {
	Status entity.NotificationStatus `json:"status" binding:"required"`
}

type ListNotificationsQuery struct {
	Limit  int `form:"limit,default=10"`
	Offset int `form:"offset,default=0"`
}

func NewNotificationHandler(service *service.NotificationService, logger *logger.Logger) *NotificationHandler {
	return &NotificationHandler{
		service: service,
		logger:  logger,
	}
}

func (h *NotificationHandler) Create(c *gin.Context) {
	var req CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Errorw("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	notification := &entity.Notification{
		Type:      req.Type,
		Recipient: req.Recipient,
		Subject:   req.Subject,
		Content:   req.Content,
	}

	if err := h.service.CreateNotification(c.Request.Context(), notification); err != nil {
		h.logger.Errorw("Failed to create notification", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, notification)
}

func (h *NotificationHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Errorw("Invalid notification ID", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		h.logger.Errorw("Failed to get notification", "error", err, "id", id)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notification"})
		return
	}

	if notification == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, notification)
}

func (h *NotificationHandler) List(c *gin.Context) {
	var query ListNotificationsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		h.logger.Errorw("Invalid query parameters", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.Limit <= 0 {
		query.Limit = 10
	}
	if query.Offset < 0 {
		query.Offset = 0
	}

	notifications, err := h.service.ListNotifications(c.Request.Context(), query.Limit, query.Offset)
	if err != nil {
		h.logger.Errorw("Failed to list notifications", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

func (h *NotificationHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Errorw("Invalid notification ID", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	var req UpdateNotificationStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Errorw("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateNotificationStatus(c.Request.Context(), id, req.Status); err != nil {
		h.logger.Errorw("Failed to update notification status", "error", err, "id", id)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification status"})
		return
	}

	c.Status(http.StatusNoContent)
}
