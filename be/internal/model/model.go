package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Officer struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Phone     string    `gorm:"uniqueIndex;not null" json:"phone"`
	Name      string    `gorm:"not null" json:"name"`
	Role      string    `gorm:"not null;default:officer" json:"role"`
	IsActive  bool      `gorm:"not null;default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type Screening struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Phone     string         `gorm:"not null" json:"phone"`
	Name      string         `gorm:"not null" json:"name"`
	Birthdate *time.Time `json:"birthdate"`
	Address   string         `json:"address"`
	Answers   datatypes.JSON `gorm:"type:jsonb;not null" json:"answers"`
	Score     int            `gorm:"not null" json:"score"`
	Result    string         `gorm:"not null" json:"result"`
	CreatedAt time.Time `json:"created_at"`
}

type ScreeningConfig struct {
	Key       string    `gorm:"primaryKey" json:"key"`
	Value     string    `gorm:"not null" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ScreeningRequest struct {
	Name      string         `json:"name" binding:"required"`
	Phone     string         `json:"phone" binding:"required"`
	Birthdate string         `json:"birthdate"`
	Address   string         `json:"address"`
	Answers   map[string]bool `json:"answers" binding:"required"`
}