package service

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/AZEINMU1911/simae-tb/internal/model"
	"github.com/AZEINMU1911/simae-tb/internal/repository"
	"gorm.io/gorm"
)

type ScreeningService struct {
	db   *gorm.DB
	repo *repository.ScreeningRepository
}

func NewScreeningService(db *gorm.DB) *ScreeningService {
	return &ScreeningService{
		db:   db,
		repo: repository.NewScreeningRepository(db),
	}
}

func (s *ScreeningService) Submit(req model.ScreeningRequest) (*model.Screening, error) {
	result, score := s.ComputeResult(req.Answers)
	answersJSON, err := json.Marshal(req.Answers)
	if err != nil {
		return nil, err
	}

	var birthdate *time.Time
	if req.Birthdate != "" {
		t, err := time.Parse("2006-01-02", req.Birthdate)
		if err == nil {
			birthdate = &t
		}
	}

	screening := &model.Screening{
		Phone:     req.Phone,
		Name:      req.Name,
		Birthdate: birthdate,
		Address:   req.Address,
		Answers:   answersJSON,
		Score:     score,
		Result:    result,
	}

	err = s.repo.Save(screening)
	if err != nil {
		return nil, err
	}

	return screening, nil
}

func (s *ScreeningService) ComputeResult(answers map[string]bool) (string, int) {
	var q1Config model.ScreeningConfig
	var thresholdConfig model.ScreeningConfig

	s.db.First(&q1Config, "key = ?", "q1_auto_suspek")
	s.db.First(&thresholdConfig, "key = ?", "score_threshold")

	q1AutoSuspek := q1Config.Value == "true"
	threshold, err := strconv.Atoi(thresholdConfig.Value)
	if err != nil {
		threshold = 3
	}

	score := 0
	for _, v := range answers {
		if v {
			score++
		}
	}

	if q1AutoSuspek && answers["q1"] {
		return "suspek", score
	}
	if score >= threshold {
		return "suspek", score
	}
	return "risiko_rendah", score
}

func (s *ScreeningService) GetByID(id string) (*model.Screening, error) {
	return s.repo.FindByID(id)
}

func (s *ScreeningService) ListAll(result string, from string, to string, page int, limit int) ([]model.Screening, int64, error) {
	return s.repo.ListAll(result, from, to, page, limit)
}