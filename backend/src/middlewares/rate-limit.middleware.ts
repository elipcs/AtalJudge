/**
 * Rate Limiting Middleware Module
 * 
 * Provides rate limiting configuration for different API endpoints.
 * Prevents abuse and protects against brute-force attacks.
 * 
 * @module middlewares/rate-limit
 */
import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Rate limiter for authentication endpoints
 * 
 * Limits login attempts to prevent brute-force attacks.
 * Window: 15 minutes, Max: 100 requests
 */
export const authRateLimiter = rateLimit({
  windowMs: config.limits.rateLimitWindowMs,
  max: config.limits.rateLimitMaxRequests,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login. Tente novamente mais tarde.',
      error: 'TOO_MANY_REQUESTS'
    });
  }
});

export const registerRateLimiter = rateLimit({
  windowMs: config.limits.rateLimitWindowMs,
  max: config.limits.rateLimitMaxRequests,
  message: 'Muitas tentativas de registro. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de registro. Tente novamente mais tarde.',
      error: 'TOO_MANY_REQUESTS'
    });
  }
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: config.limits.rateLimitWindowMs,
  max: config.limits.rateLimitMaxRequests,
  message: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
      error: 'TOO_MANY_REQUESTS'
    });
  }
});

export const submissionRateLimiter = rateLimit({
  windowMs: config.limits.rateLimitWindowMs,
  max: config.limits.submissionMaxRequests,
  message: 'Muitas submissões. Aguarde um momento.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Muitas submissões. Aguarde um momento antes de tentar novamente.',
      error: 'TOO_MANY_REQUESTS'
    });
  }
});

