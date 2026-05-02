import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Security middleware and utilities
 */

// Simple in-memory rate limiter (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 * Limits requests per IP address
 */
export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(ip, record);
    }

    record.count++;

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", record.resetTime);

    if (record.count > maxRequests) {
      res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * CSRF token generation
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * CSRF token validation middleware
 */
export function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for GET requests
  if (req.method === "GET") {
    return next();
  }

  const token = req.headers["x-csrf-token"] as string;
  const sessionToken = req.cookies?.csrf_token;

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({ error: "CSRF token validation failed" });
    return;
  }

  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://accounts.google.com"
  );

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  next();
}

/**
 * Secure password hashing (PBKDF2)
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, useSalt, 100000, 64, "sha256")
    .toString("hex");

  return { hash, salt: useSalt };
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt);
  return newHash === hash;
}

/**
 * Key derivation from password using PBKDF2
 */
export function deriveKeyFromPassword(
  password: string,
  salt: string,
  iterations: number = 100000,
  keyLength: number = 32
): string {
  const key = crypto.pbkdf2Sync(password, salt, iterations, keyLength, "sha256");
  return key.toString("hex");
}

/**
 * Generate secure random salt
 */
export function generateSalt(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Cleanup old rate limit records (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const ipsToDelete: string[] = [];
  rateLimitStore.forEach((record, ip) => {
    if (now > record.resetTime) {
      ipsToDelete.push(ip);
    }
  });
  ipsToDelete.forEach((ip) => rateLimitStore.delete(ip));
}
