package repository

import (
	"github.com/AZEINMU1911/simae-tb/internal/model"
	"gorm.io/gorm"
)

type OfficerRepository struct {
	db *gorm.DB
}

func NewOfficerRepository(db *gorm.DB) *OfficerRepository {
	return &OfficerRepository{db: db}
}

func (r *OfficerRepository) FindByPhone(phone string) (*model.Officer, error) {
	var officer model.Officer
	result := r.db.First(&officer, "phone = ? AND is_active = true", phone)
	if result.Error != nil {
		return nil, result.Error
	}
	return &officer, nil
}