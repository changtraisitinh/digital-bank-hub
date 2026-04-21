package main

import (
	"context"
	"fmt"
	"github.com/pquerna/otp/totp"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"mfa-go-service/internal/database"
	"mfa-go-service/internal/middleware"
	"mfa-go-service/internal/models"
	"mfa-go-service/internal/services"
	"mfa-go-service/internal/utils"
)

const (
	defaultPort     = ":8100"
	readTimeout     = 10 * time.Second
	writeTimeout    = 10 * time.Second
	shutdownTimeout = 15 * time.Second
	requestTimeout  = 5 * time.Second
)

type Server struct {
	router     *mux.Router
	log        *logrus.Logger
	jwtService *services.JWTService
	otpService *services.OTPService
	middleware *middleware.Middleware
	httpServer *http.Server
}

func NewServer() (*Server, error) {
	log := logrus.New()
	log.SetFormatter(&logrus.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.InfoLevel)

	// Initialize database
	db, err := database.InitDB(log)
	if err != nil {
		return nil, err
	}

	// Initialize services
	jwtKey := []byte(os.Getenv("JWT_KEY"))
	if len(jwtKey) == 0 {
		jwtKey = []byte("my_secret_key") // Default key for development
	}

	jwtService := services.NewJWTService(jwtKey, log)
	otpService := services.NewOTPService(db, log, os.Getenv("ISSUER"))
	rateLimitService := services.NewRateLimitService()
	mw := middleware.NewMiddleware(jwtService, rateLimitService, log)

	router := mux.NewRouter()

	server := &Server{
		router:     router,
		log:        log,
		jwtService: jwtService,
		otpService: otpService,
		middleware: mw,
	}

	server.setupRoutes()
	server.setupHTTPServer()

	return server, nil
}

func (s *Server) setupHTTPServer() {
	s.httpServer = &http.Server{
		Addr:         defaultPort,
		Handler:      s.router,
		ReadTimeout:  readTimeout,
		WriteTimeout: writeTimeout,
	}
}

func (s *Server) setupRoutes() {
	// Add common middleware for all routes
	s.router.Use(s.middleware.RequestLogger)
	s.router.Use(s.middleware.RecoveryMiddleware)

	// Create a subrouter with API prefix
	api := s.router.PathPrefix("/api/v1").Subrouter()

	// Login endpoint
	api.HandleFunc("/login", s.handleLogin).Methods(http.MethodGet, http.MethodOptions)

	// OTP endpoints
	api.HandleFunc("/generate", s.middleware.RateLimit(s.handleGenerateOTP)).Methods(http.MethodGet, http.MethodOptions)
	api.HandleFunc("/verify", s.middleware.RateLimit(s.handleVerifyOTP)).Methods(http.MethodGet, http.MethodOptions)

	// Add CORS middleware
	api.Use(s.middleware.CORS)

	// Add method not allowed handler
	s.router.MethodNotAllowedHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		utils.RespondWithError(w, http.StatusMethodNotAllowed,
			fmt.Sprintf("Method %s not allowed", r.Method))
	})

	// Add not found handler
	s.router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		utils.RespondWithError(w, http.StatusNotFound, "Endpoint not found")
	})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	email := r.URL.Query().Get("email")
	if email == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	token, err := s.jwtService.GenerateToken(email)
	if err != nil {
		select {
		case <-ctx.Done():
			utils.RespondWithError(w, http.StatusGatewayTimeout, "Request timeout")
			return
		default:
			s.log.WithError(err).Error("Failed to generate token")
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
			return
		}
	}

	s.log.WithField("email", email).Info("JWT generated")
	utils.RespondWithJSON(w, http.StatusOK, models.LoginResponse{
		Token: token,
		Email: email,
	})
}

func (s *Server) handleGenerateOTP(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	email := r.URL.Query().Get("email")
	if email == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	var secret string
	var err error

	select {
	case <-ctx.Done():
		utils.RespondWithError(w, http.StatusGatewayTimeout, "Request timeout")
		return
	default:
		secret, err = s.otpService.GenerateOTP(email)
		if err != nil {
			s.log.WithError(err).Error("Failed to generate OTP")
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to generate OTP")
			return
		}
	}

	// Generate the OTP
	otp, err := totp.GenerateCode(secret, time.Now())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Secret:", secret)
	fmt.Println("Generated OTP:", otp)

	// Send the OTP to the user via email or SMS (not implemented here)
	//TODO: Implement sending OTP via email or SMS

	// Generate JWT
	token, err := s.jwtService.GenerateJWT(email)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated JWT:", token)

	utils.RespondWithJSON(w, http.StatusOK, models.OTPResponse{
		Message: "OTP generated successfully",
		Email:   email,
		Status:  true,
		Jwt:     token,
	})
}

func (s *Server) handleVerifyOTP(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	email := r.URL.Query().Get("email")
	otp := r.URL.Query().Get("otp")

	if email == "" || otp == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Email and OTP are required")
		return
	}

	var valid bool
	var verifiedAt, generatedAt time.Time
	var err error

	select {
	case <-ctx.Done():
		utils.RespondWithError(w, http.StatusGatewayTimeout, "Request timeout")
		return
	default:
		valid, verifiedAt, generatedAt, err = s.otpService.VerifyOTP(email, otp)
		if err != nil {
			s.log.WithError(err).Error("Failed to verify OTP")
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to verify OTP")
			return
		}
	}

	statusCode := http.StatusOK
	if !valid {
		statusCode = http.StatusUnauthorized
	}

	utils.RespondWithJSON(w, statusCode, models.OTPVerificationResponse{
		Email:       email,
		Valid:       valid,
		VerifiedAt:  verifiedAt,
		GeneratedAt: generatedAt,
		Message:     "OTP verification completed",
	})
}

func (s *Server) Run() error {
	// Channel to listen for errors coming from the listener.
	serverErrors := make(chan error, 1)

	// Start the service listening for requests.
	go func() {
		s.log.WithField("port", defaultPort).Info("API listening")
		serverErrors <- s.httpServer.ListenAndServe()
	}()

	// Channel to listen for an interrupt or terminate signal from the OS.
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt)

	select {
	case err := <-serverErrors:
		return err
	case <-shutdown:
		s.log.Info("Starting shutdown...")

		// Create context for Shutdown call.
		ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()

		// Gracefully shutdown the server by waiting for existing requests
		// to complete.
		err := s.httpServer.Shutdown(ctx)
		if err != nil {
			s.log.WithError(err).Error("Graceful shutdown did not complete")
			err = s.httpServer.Close()
		}

		if err != nil {
			return err
		}
	}

	return nil
}

func main() {
	server, err := NewServer()
	if err != nil {
		panic(err)
	}

	if err := server.Run(); err != nil {
		server.log.WithError(err).Fatal("Server error")
	}
}
