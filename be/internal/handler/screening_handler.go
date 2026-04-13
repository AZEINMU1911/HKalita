package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/AZEINMU1911/simae-tb/internal/model"
	"github.com/AZEINMU1911/simae-tb/internal/service"
)

type ScreeningHandler struct {
	service *service.ScreeningService
}

func NewScreeningHandler(db *gorm.DB) *ScreeningHandler {
	return &ScreeningHandler{
		service: service.NewScreeningService(db),
	}
}

func (h *ScreeningHandler) Submit(c *gin.Context) {
	var req model.ScreeningRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	screening, err := h.service.Submit(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save screening"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": screening,
	})
}
