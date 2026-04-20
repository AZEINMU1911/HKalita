package handler

import (
	"net/http"
	"strconv"

	"errors"

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

	requiredKeys := []string{"q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"}
	for _, key := range requiredKeys {
		if _, ok := req.Answers[key]; !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Semua pertanyaan harus dijawab"})
			return
		}
	}

	screening, err := h.service.Submit(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save screening"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": screening})
}

func (h *ScreeningHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	screening, err := h.service.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Screening not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch screening"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": screening})
}

func (h *ScreeningHandler) ListAll(c *gin.Context) {
	result := c.Query("result")
	from := c.Query("from")
	to := c.Query("to")

	page := 1
	limit := 20

	if p := c.Query("page"); p != "" {
		if val, err := strconv.Atoi(p); err == nil && val > 0 {
			page = val
		}
	}
	if l := c.Query("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			limit = val
		}
	}

	screenings, total, err := h.service.ListAll(result, from, to, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch screenings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": screenings,
		"meta": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

func (h *ScreeningHandler) DeleteByID(c *gin.Context) {
	id := c.Param("id")
	err := h.service.DeleteByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Data berhasil dihapus"}})
}

func (h *ScreeningHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stats})
}
