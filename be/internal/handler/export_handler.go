package handler

import (
	"net/http"
	"time"

	"github.com/AZEINMU1911/simae-tb/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ExportHandler struct {
	service *service.ExportService
}

func NewExportHandler(db *gorm.DB) *ExportHandler {
	return &ExportHandler{
		service: service.NewExportService(db),
	}
}

func (h *ExportHandler) ExportExcel(c *gin.Context) {
	result := c.Query("result")
	from := c.Query("from")
	to := c.Query("to")

	f, err := h.service.ExportScreenings(result, from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate export"})
		return
	}

	filename := "skrining-tb-" + time.Now().Format("2006-01-02") + ".xlsx"
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

	f.Write(c.Writer)
}
