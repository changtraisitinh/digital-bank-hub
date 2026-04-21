package repository

import (
	"context"
	"github.com/google/uuid"
	"notification_service/internal/domain/entity"
)

type NotificationRepository interface {
	Create(ctx context.Context, notification *entity.Notification) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Notification, error)
	Update(ctx context.Context, notification *entity.Notification) error
	List(ctx context.Context, limit, offset int) ([]entity.Notification, error)
}
