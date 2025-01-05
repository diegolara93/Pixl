package main

import (
	"context"
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

// PixelData is our 2D array of hex color strings
// We'll use GORM's serializer:json to automatically
// store this as JSON in the database (Postgres jsonb).
type PixelData [][]string

// User represents the users table in PostgreSQL
type User struct {
	UID       string    `gorm:"primaryKey;column:uid"`
	Email     string    `gorm:"unique;not null;column:email"`
	CreatedAt time.Time `gorm:"column:created_at"`

	// A user can have many drawings
	Drawings []Drawing `gorm:"foreignKey:UserUID"`
}

// Drawing represents a pixel drawing belonging to a specific user
type Drawing struct {
	ID uint `gorm:"primaryKey;autoIncrement"`
	// Store the 2D pixel data as JSON using serializer:json
	Drawing   PixelData `gorm:"type:jsonb;serializer:json"`
	CreatedAt time.Time

	// Foreign key to associate a Drawing with a User
	// This references the User.UID field
	UserUID string `gorm:"not null;index"`

	// Optional: relationship back to the User
	// OnDelete:CASCADE means if a user is deleted, all their drawings go too
	User *User `gorm:"foreignKey:UserUID;constraint:OnDelete:CASCADE"`
}

func main() {
	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"http://localhost:3000"},
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
		log.Fatalf("error initializing Firebase app: %v", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Firebase auth client: %v", err)
	}

	// Initialize GORM with PostgreSQL
	dsn := "host=localhost user=postgres password=Chivas933! dbname=pixl_db port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Migrate the schema
	// This creates/updates the tables for User and Drawing
	if err := db.AutoMigrate(&User{}, &Drawing{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Unprotected route: signup
	e.POST("/api/signup", func(c echo.Context) error {
		type SignupRequest struct {
			UID   string `json:"uid" validate:"required"`
			Email string `json:"email" validate:"required,email"`
		}

		var req SignupRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		// Basic validation
		if req.UID == "" || req.Email == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "UID and Email are required"})
		}

		// Check if user already exists
		var existingUser User
		result := db.First(&existingUser, "uid = ?", req.UID)
		if result.Error == nil {
			// If no error, it means we found a user
			return c.JSON(http.StatusConflict, map[string]string{"error": "User already exists"})
		}

		// If record not found, create a new user
		newUser := User{
			UID:       req.UID,
			Email:     req.Email,
			CreatedAt: time.Now(),
		}

		if err := db.Create(&newUser).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
		}

		return c.JSON(http.StatusCreated, map[string]string{"message": "User created successfully"})
	})

	// Protected group: must have a valid Firebase token
	r := e.Group("/api")
	r.Use(firebaseAuthMiddleware(authClient))

	// Protected route: save a drawing for the authenticated user
	r.POST("/save-drawing", func(c echo.Context) error {
		type SaveDrawingRequest struct {
			Drawing PixelData `json:"drawing"`
		}

		var req SaveDrawingRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		// The firebaseAuthMiddleware sets "userUID" in context
		userUID := c.Get("userUID").(string)

		newDrawing := Drawing{
			Drawing:   req.Drawing,
			CreatedAt: time.Now(),
			UserUID:   userUID, // associate with the user from token
		}

		if err := db.Create(&newDrawing).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save drawing"})
		}

		return c.JSON(http.StatusCreated, map[string]string{"message": "Drawing saved successfully"})
	})

	// Protected route: get the authenticated user and their drawings
	r.GET("/me", func(c echo.Context) error {
		userUID := c.Get("userUID").(string)

		var user User
		err := db.Preload("Drawings").First(&user, "uid = ?", userUID).Error
		if err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}

		return c.JSON(http.StatusOK, user)
	})

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}

// firebaseAuthMiddleware verifies the Firebase ID Token.
// If valid, it sets c.Set("userUID", <the user’s UID>) so handlers can use it.
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
			token, err := authClient.VerifyIDToken(context.Background(), idToken)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid or expired token"})
			}

			// Token is valid, store user UID in context
			c.Set("userUID", token.UID)

			return next(c)
		}
	}
}
