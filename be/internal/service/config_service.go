package service

import (
	"github.com/AZEINMU1911/simae-tb/internal/model"
	"github.com/AZEINMU1911/simae-tb/internal/repository"
	"gorm.io/gorm"
)

type ConfigService struct {
	repo *repository.ConfigRepository
}

func NewConfigService(db *gorm.DB) *ConfigService {
	return &ConfigService{
		repo: repository.NewConfigRepository(db),
	}
}

func (s *ConfigService) GetAll() ([]model.ScreeningConfig, error) {
	return s.repo.GetAll()
}

func (s *ConfigService) Update(key string, value string) error {
	return s.repo.Update(key, value)
}