package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/AZEINMU1911/simae-tb/internal/service"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("simae_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		claims := &service.Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("officer_id", claims.OfficerID)
		c.Set("role", claims.Role)
		c.Next()
	}
}