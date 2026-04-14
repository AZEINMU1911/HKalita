package repository

import (
	"github.com/AZEINMU1911/simae-tb/internal/model"
	"gorm.io/gorm"
	"time"
)

type ConfigRepository struct {
	db *gorm.DB
}

func NewConfigRepository(db *gorm.DB) *ConfigRepository {
	return &ConfigRepository{db: db}
}

func (r *ConfigRepository) GetAll() ([]model.ScreeningConfig, error) {
	var configs []model.ScreeningConfig
	err := r.db.Find(&configs).Error
	return configs, err
}

func (r *ConfigRepository) Update(key string, value string) error {
	return r.db.Model(&model.ScreeningConfig{}).
		Where("key = ?", key).
		Updates(map[string]interface{}{
			"value":      value,
			"updated_at": time.Now(),
		}).Error
}