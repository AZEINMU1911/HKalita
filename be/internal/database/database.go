package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/AZEINMU1911/simae-tb/internal/model"
)

func Connect(dbURL string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	fmt.Println("Database connected")

	err = db.AutoMigrate(&model.Officer{}, &model.Screening{}, &model.ScreeningConfig{})
	if err != nil {
		log.Fatal("AutoMigrate failed:", err)
	}
	fmt.Println("Database migration successful")

	seedConfig(db)

	return db
}

func seedConfig(db *gorm.DB) {
	defaults := []model.ScreeningConfig{
		{Key: "q1_auto_suspek", Value: "true", UpdatedAt: time.Now()},
		{Key: "score_threshold", Value: "3", UpdatedAt: time.Now()},
	}

	for _, cfg := range defaults {
		var existing model.ScreeningConfig
		result := db.First(&existing, "key = ?", cfg.Key)
		if result.Error != nil {
			db.Create(&cfg)
			fmt.Println("Seeded config:", cfg.Key, "=", cfg.Value)
		}
	}
}