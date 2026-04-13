package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/AZEINMU1911/simae-tb/internal/service"
	"gorm.io/gorm"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		service: service.NewAuthService(db),
	}
}

type LoginRequest struct {
	Phone string `json:"phone" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number is required"})
		return
	}

	token, err := h.service.Login(req.Phone)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Phone number not recognized"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
		return
	}

	c.SetCookie("simae_token", token, 86400, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Login successful"}})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("simae_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Logged out"}})
}