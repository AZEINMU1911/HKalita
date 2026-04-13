package service

import (
	"errors"
	"os"
	"time"

	"github.com/AZEINMU1911/simae-tb/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type AuthService struct {
	repo *repository.OfficerRepository
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{
		repo: repository.NewOfficerRepository(db),
	}
}

type Claims struct {
	OfficerID string `json:"officer_id"`
	Role      string `json:"role"`
	jwt.RegisteredClaims
}

func (s *AuthService) Login(phone string) (string, error) {
	officer, err := s.repo.FindByPhone(phone)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("unauthorized")
		}
		return "", err
	}

	claims := Claims{
		OfficerID: officer.ID.String(),
		Role:      officer.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", err
	}

	return signed, nil
}