package entity

import (
	"fmt"
	"github.com/google/uuid"
	"time"
)

type NotificationType string

const (
	NotificationTypeEmail NotificationType = "EMAIL"
	NotificationTypeSMS   NotificationType = "SMS"
	NotificationTypePush  NotificationType = "PUSH"
)

func ParseNotificationType(s string) (NotificationType, error) {
	switch s {
	case string(NotificationTypeEmail):
		return NotificationTypeEmail, nil
	case string(NotificationTypeSMS):
		return NotificationTypeSMS, nil
	case string(NotificationTypePush):
		return NotificationTypePush, nil
	default:
		return "", fmt.Errorf("invalid notification type: %s", s)
	}
}

type NotificationStatus string

const (
	StatusPending NotificationStatus = "pending"
	StatusSent    NotificationStatus = "sent"
	StatusFailed  NotificationStatus = "failed"
)

type Notification struct {
	ID        uuid.UUID          `json:"id"`
	Type      NotificationType   `json:"type" validate:"required,notification_type"`
	Recipient string             `json:"recipient" validate:"required"`
	Subject   string             `json:"subject" validate:"required,min=1,max=255"`
	Content   string             `json:"content" validate:"required"`
	Status    NotificationStatus `json:"status"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
	SentAt    *time.Time         `json:"sent_at,omitempty"`
}
