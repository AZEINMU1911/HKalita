package router

import (
	"github.com/gin-gonic/gin"
	// "github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gin-contrib/cors"
	"gorm.io/gorm"

	"github.com/AZEINMU1911/simae-tb/internal/handler"
	"github.com/AZEINMU1911/simae-tb/internal/middleware"
)

func Setup(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	screeningHandler := handler.NewScreeningHandler(db)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/screening", screeningHandler.Submit)
		v1.GET("/screening/:id", screeningHandler.GetByID)

		authHandler := handler.NewAuthHandler(db)
		v1.POST("/auth/login", authHandler.Login)
		v1.POST("/auth/logout", authHandler.Logout)
		// !PROTECTED ROUTES
		protected := v1.Group("/")
		configHandler := handler.NewConfigHandler(db)
		protected.Use(middleware.RequireAuth())
		{
			protected.GET("/screenings", screeningHandler.ListAll)
			protected.GET("/dashboard/stats", screeningHandler.GetStats)
			protected.GET("/config", configHandler.GetAll)
			protected.PUT("/config", configHandler.Update)
		}
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))
	
	return r
}
