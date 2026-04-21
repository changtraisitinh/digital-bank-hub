package postgres

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
	"notification_service/internal/domain/entity"
)

type notificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *notificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(ctx context.Context, n *entity.Notification) error {
	query := `
        INSERT INTO notifications (id, type, recipient, subject, content, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `
	_, err := r.db.ExecContext(ctx, query,
		n.ID, n.Type, n.Recipient, n.Subject, n.Content, n.Status, n.CreatedAt, n.UpdatedAt)
	return err
}

func (r *notificationRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Notification, error) {
	query := `
        SELECT id, type, recipient, subject, content, status, created_at, updated_at, sent_at
        FROM notifications WHERE id = $1
    `
	n := &entity.Notification{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&n.ID, &n.Type, &n.Recipient, &n.Subject, &n.Content,
		&n.Status, &n.CreatedAt, &n.UpdatedAt, &n.SentAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return n, err
}

func (r *notificationRepository) Update(ctx context.Context, n *entity.Notification) error {
	query := `
        UPDATE notifications 
        SET type = $2, recipient = $3, subject = $4, content = $5,
            status = $6, updated_at = $7, sent_at = $8
        WHERE id = $1
    `
	_, err := r.db.ExecContext(ctx, query,
		n.ID, n.Type, n.Recipient, n.Subject, n.Content,
		n.Status, n.UpdatedAt, n.SentAt)
	return err
}

func (r *notificationRepository) List(ctx context.Context, limit, offset int) ([]entity.Notification, error) {
	query := `
        SELECT id, type, recipient, subject, content, status, created_at, updated_at, sent_at
        FROM notifications ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `
	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []entity.Notification
	for rows.Next() {
		var n entity.Notification
		if err := rows.Scan(&n.ID, &n.Type, &n.Recipient, &n.Subject, &n.Content,
			&n.Status, &n.CreatedAt, &n.UpdatedAt, &n.SentAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, rows.Err()
}
