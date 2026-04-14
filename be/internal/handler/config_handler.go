package handler

import (
	"net/http"
	"strconv"

	"github.com/AZEINMU1911/simae-tb/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ConfigHandler struct {
	service *service.ConfigService
}

func NewConfigHandler(db *gorm.DB) *ConfigHandler {
	return &ConfigHandler{
		service: service.NewConfigService(db),
	}
}

func (h *ConfigHandler) GetAll(c *gin.Context) {
	configs, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": configs})
}

type UpdateConfigRequest struct {
	Key   string `json:"key" binding:"required"`
	Value string `json:"value" binding:"required"`
}

func (h *ConfigHandler) Update(c *gin.Context) {
	var req UpdateConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Key == "score_threshold" {
		val, err := strconv.Atoi(req.Value)
		if err != nil || val < 1 || val > 9 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "score_threshold harus berupa angka antara 1-9"})
			return
		}
	}

	if req.Key == "q1_auto_suspek" && req.Value != "true" && req.Value != "false" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q1_auto_suspek harus bernilai true atau false"})
		return
	}

	err := h.service.Update(req.Key, req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Config updated"}})
}
