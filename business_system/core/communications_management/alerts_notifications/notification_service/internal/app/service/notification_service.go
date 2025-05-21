package service

import (
	"context"
	"github.com/google/uuid"
	"notification_service/internal/domain/entity"
	"notification_service/internal/domain/repository"
	"notification_service/pkg/logger"
	"time"
)

type NotificationService struct {
	repo   repository.NotificationRepository
	logger *logger.Logger
}

func NewNotificationService(repo repository.NotificationRepository, logger *logger.Logger) *NotificationService {
	return &NotificationService{
		repo:   repo,
		logger: logger,
	}
}

func (s *NotificationService) CreateNotification(ctx context.Context, n *entity.Notification) error {
	n.ID = uuid.New()
	n.Status = entity.StatusPending
	n.CreatedAt = time.Now()
	n.UpdatedAt = time.Now()

	if err := s.repo.Create(ctx, n); err != nil {
		s.logger.Errorw("Failed to create notification",
			"error", err,
			"notification_id", n.ID)
		return err
	}

	s.logger.Infow("Notification created",
		"notification_id", n.ID,
		"type", n.Type)
	return nil
}

func (s *NotificationService) GetNotification(ctx context.Context, id uuid.UUID) (*entity.Notification, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *NotificationService) UpdateNotificationStatus(ctx context.Context, id uuid.UUID, status entity.NotificationStatus) error {
	n, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	n.Status = status
	n.UpdatedAt = time.Now()
	if status == entity.StatusSent {
		now := time.Now()
		n.SentAt = &now
	}

	return s.repo.Update(ctx, n)
}

func (s *NotificationService) ListNotifications(ctx context.Context, limit, offset int) ([]entity.Notification, error) {
	notifications, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		s.logger.Errorw("Failed to list notifications",
			"error", err,
			"limit", limit,
			"offset", offset)
		return nil, err
	}

	s.logger.Infow("Notifications listed",
		"count", len(notifications),
		"limit", limit,
		"offset", offset)
	return notifications, nil
}
