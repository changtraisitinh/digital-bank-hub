package database

import (
	"database/sql"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var db *sql.DB

func InitDB(log *logrus.Logger) (*sql.DB, error) {
	var err error
	connStr := "user=postgres dbname=dibank_auth sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	createTableSQL := `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            secret VARCHAR(255) NOT NULL,
            otp_generated_at TIMESTAMP NOT NULL
        );`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, err
	}

	return db, nil
}
