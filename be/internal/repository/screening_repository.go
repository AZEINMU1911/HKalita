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

func (r *ScreeningRepository) FindByID(id string) (*model.Screening, error) {
	var screening model.Screening
	result := r.db.First(&screening, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &screening, nil
}

func (r *ScreeningRepository) ListAll(result string, from string, to string, page int, limit int) ([]model.Screening, int64, error) {
	var screenings []model.Screening
	var total int64

	query := r.db.Model(&model.Screening{})

	if result != "" {
		query = query.Where("result = ?", result)
	}
	if from != "" {
		query = query.Where("created_at >= ?", from)
	}
	if to != "" {
		query = query.Where("created_at <= ?", to)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&screenings).Error
	if err != nil {
		return nil, 0, err
	}

	return screenings, total, nil
}