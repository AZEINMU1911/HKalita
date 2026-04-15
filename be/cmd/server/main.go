package main

import (
	"fmt"
	"log"
	"os"

	"github.com/AZEINMU1911/simae-tb/internal/database"
	"github.com/AZEINMU1911/simae-tb/internal/router"
	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("[SIMAE SERVER STARTING]")

	err := godotenv.Load()
	if err != nil {
    	log.Println("No .env file found, using environment variables")
	}
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT environment variable not set")
	} else {
		fmt.Println("Server running on port:", port)
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL env variable has not been set")
	} else {
		fmt.Println("Database URL:", dbURL)
	}

	db := database.Connect(dbURL)
	r := router.Setup(db)
	r.Run(":"+ port)

}
