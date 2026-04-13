package repository

import (
	"github.com/AZEINMU1911/simae-tb/internal/model"
	"gorm.io/gorm"
)

type ScreeningRepository struct {
	db *gorm.DB
}

func NewScreeningRepository(db *gorm.DB) *ScreeningRepository {
	return &ScreeningRepository{db: db}
}

func (r *ScreeningRepository) Save(screening *model.Screening) error {
	return r.db.Create(screening).Error
}