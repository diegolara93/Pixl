package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"google.golang.org/api/option"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PixelData [][]string

type User struct {
	UID       string    `gorm:"primaryKey;column:uid"`
	Email     string    `gorm:"unique;not null;column:email"`
	CreatedAt time.Time `gorm:"column:created_at"`

	Drawings []Drawing `gorm:"foreignKey:UserUID"`
}

type Drawing struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	Drawing   PixelData `gorm:"type:jsonb;serializer:json"`
	CreatedAt time.Time

	UserUID string `gorm:"not null;index"`

	User *User `gorm:"foreignKey:UserUID;constraint:OnDelete:CASCADE"`
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file (it might not exist).")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback if not set
	}

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	dsn := "host=" + dbHost + " user=" + dbUser + " password=" + dbPass + " dbname=" + dbName + " port=" + dbPort + " sslmode=disable"

	opt := option.WithCredentialsFile("firebase.json")
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"http://localhost:3000", "https://pixl-three.vercel.app", "https://pixl-git-main-diegos-projects-c68a74fc.vercel.app", "https://pixl-k7zvm7f0l-diegos-projects-c68a74fc.vercel.app/"},
		AllowMethods:  []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders:  []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
	}))

	ctx := context.Background()

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing Firebase app: %v", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Firebase auth client: %v", err)
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(&User{}, &Drawing{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

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

		// Check if user already exists
		var existingUser User
		result := db.First(&existingUser, "uid = ?", req.UID)
		if result.Error == nil {
			return c.JSON(http.StatusConflict, map[string]string{"error": "User already exists"})
		}

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

	r.POST("/save-drawing", func(c echo.Context) error {
		type SaveDrawingRequest struct {
			Drawing PixelData `json:"drawing"`
		}

		var req SaveDrawingRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		userUID := c.Get("userUID").(string)

		newDrawing := Drawing{
			Drawing:   req.Drawing,
			CreatedAt: time.Now(),
			UserUID:   userUID,
		}

		if err := db.Create(&newDrawing).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save drawing"})
		}

		return c.JSON(http.StatusCreated, map[string]string{"message": "Drawing saved successfully"})
	})

	r.GET("/me", func(c echo.Context) error {
		userUID := c.Get("userUID").(string)

		var user User
		err := db.Preload("Drawings").First(&user, "uid = ?", userUID).Error
		if err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}

		return c.JSON(http.StatusOK, user)
	})

	e.Logger.Fatal(e.Start(":8080"))
}

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

			c.Set("userUID", token.UID)

			return next(c)
		}
	}
}
