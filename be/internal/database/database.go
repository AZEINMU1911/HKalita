package database

import (
	"fmt"
	"log"

	"github.com/AZEINMU1911/simae-tb/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dbURL string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Invalid database connection string", err)
	}
	fmt.Println("Database connection successful")

	err = db.AutoMigrate(&model.Officer{}, &model.Screening{}, &model.ScreeningConfig{})
	if err != nil {
		log.Fatal("Error occurred during database migration", err)
	}
	fmt.Println("Database migration successful")

	return db
}
