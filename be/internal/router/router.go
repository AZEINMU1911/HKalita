package router

import (
	"github.com/gin-gonic/gin"
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

		protected := v1.Group("/")
		protected.Use(middleware.RequireAuth())
		{
			protected.GET("/screenings", screeningHandler.ListAll)
		}
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	return r
}
