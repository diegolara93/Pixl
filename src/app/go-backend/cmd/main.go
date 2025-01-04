package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"google.golang.org/api/option"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// User represents the users table in PostgreSQL
type User struct {
	UID       string    `gorm:"primaryKey;column:uid"`
	Email     string    `gorm:"unique;not null;column:email"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func main() {
	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"http://localhost:3000"}, // ORIGIN OF API CALL CHANGE THIS LATER
		AllowMethods:  []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders:  []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
	}))

	// Initialize Firebase Admin SDK
	filePath := filepath.Join("..", "..", "firebase", "pixl-3d6ba-firebase-adminsdk-8yol2-b6b2984610.json")
	ctx := context.Background()
	opt := option.WithCredentialsFile(filePath)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	// Initialize GORM with PostgreSQL
	dsn := "host=localhost user=postgres password=Chivas933! dbname=pixl_db port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Migrate the schema
	if err := db.AutoMigrate(&User{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// routes exposed to frontend for signing-up
	e.POST("/api/signup", func(c echo.Context) error {
		type SignupRequest struct {
			UID   string `json:"uid" validate:"required"`
			Email string `json:"email" validate:"required,email"`
		}

		var req SignupRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		if req.UID == "" || req.Email == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "UID and Email are required"})
		}

		// checks if user exists then creates one if it doesnt
		var existingUser User
		result := db.First(&existingUser, "uid = ?", req.UID)
		if result.Error == nil {
			return c.JSON(http.StatusConflict, map[string]string{"error": "User already exists"})
		}

		user := User{
			UID:       req.UID,
			Email:     req.Email,
			CreatedAt: time.Now(),
		}

		if err := db.Create(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
		}

		return c.JSON(http.StatusCreated, map[string]string{"message": "User created successfully"})
	})

	// Protected routes
	r := e.Group("/api")
	r.Use(firebaseAuthMiddleware(authClient))

	r.GET("/protected", func(c echo.Context) error {
		userUID := c.Get("userUID").(string)
		return c.JSON(http.StatusOK, map[string]string{
			"message": fmt.Sprintf("Hello, user %s! This is a protected endpoint.", userUID),
		})
	})

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}

// Middleware to verify Firebase ID Token
func firebaseAuthMiddleware(authClient *auth.Client) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Missing Authorization header"})
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid Authorization header format"})
			}

			idToken := parts[1]

			// Verify the ID token
			token, err := authClient.VerifyIDToken(context.Background(), idToken)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid or expired token"})
			}

			// Set user UID in context
			c.Set("userUID", token.UID)

			return next(c)
		}
	}
}
