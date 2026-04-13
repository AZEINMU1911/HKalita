package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/AZEINMU1911/simae-tb/internal/handler"
)

func Setup(db *gorm.DB) *gin.Engine {
	r := gin.Default()

		screeningHandler := handler.NewScreeningHandler(db)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/screening", screeningHandler.Submit)
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	return r
}
