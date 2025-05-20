package services

import (
	"golang.org/x/time/rate"
	"sync"
)

type RateLimitService struct {
	limiters map[string]*rate.Limiter
	mu       sync.Mutex
}

func NewRateLimitService() *RateLimitService {
	return &RateLimitService{
		limiters: make(map[string]*rate.Limiter),
	}
}

func (s *RateLimitService) GetLimiter(email string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()

	limiter, exists := s.limiters[email]
	if !exists {
		limiter = rate.NewLimiter(1, 3) // 1 request per second with burst of 3
		s.limiters[email] = limiter
	}

	return limiter
}
