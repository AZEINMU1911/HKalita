package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Officer struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Phone     string    `gorm:"uniqueIndex;not null"`
	Name      string    `gorm:"not null"`
	Role      string    `gorm:"not null;default:officer"`
	IsActive  bool      `gorm:"not null;default:true"`
	CreatedAt time.Time
}

type Screening struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Phone     string         `gorm:"not null"`
	Name      string         `gorm:"not null"`
	Birthdate *time.Time
	Address   string
	Answers   datatypes.JSON `gorm:"type:jsonb;not null"`
	Score     int            `gorm:"not null"`
	Result    string         `gorm:"not null"`
	CreatedAt time.Time
}

type ScreeningConfig struct {
	Key       string    `gorm:"primaryKey"`
	Value     string    `gorm:"not null"`
	UpdatedAt time.Time
}

type ScreeningRequest struct {
	Name      string         `json:"name" binding:"required"`
	Phone     string         `json:"phone" binding:"required"`
	Birthdate string         `json:"birthdate"`
	Address   string         `json:"address"`
	Answers   map[string]bool `json:"answers" binding:"required"`
}