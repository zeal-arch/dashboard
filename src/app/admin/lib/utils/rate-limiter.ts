/**
 * Simple in-memory rate limiter for API routes
 * Tracks requests by IP address and enforces rate limits
 * 
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private requests: Map<string, RateLimitInfo> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Cleanup old entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Check if a request should be rate limited
     * @param identifier - Unique identifier (e.g., IP address or user ID)
     * @param maxRequests - Maximum requests allowed in the time window
     * @param windowMs - Time window in milliseconds (default: 15 minutes)
     * @returns Object with isLimited boolean and remaining count
     */
    check(
        identifier: string,
        maxRequests: number = 5,
        windowMs: number = 15 * 60 * 1000
    ): { isLimited: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const record = this.requests.get(identifier);

        // No previous requests or window expired
        if (!record || now > record.resetTime) {
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            return {
                isLimited: false,
                remaining: maxRequests - 1,
                resetTime: now + windowMs,
            };
        }

        // Increment count
        record.count++;

        // Check if limit exceeded
        if (record.count > maxRequests) {
            return {
                isLimited: true,
                remaining: 0,
                resetTime: record.resetTime,
            };
        }

        return {
            isLimited: false,
            remaining: maxRequests - record.count,
            resetTime: record.resetTime,
        };
    }

    /**
     * Reset rate limit for a specific identifier
     */
    reset(identifier: string): void {
        this.requests.delete(identifier);
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * Cleanup and stop the interval
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.requests.clear();
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

/**
 * Get client identifier from request
 * Tries to get IP from various headers (for proxies/load balancers)
 */
export function getClientIdentifier(request: Request): string {
    const headers = request.headers;

    // Try to get real IP from common middleware headers
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a generic identifier
    // In a real app, you might want to use a session ID or other identifier
    return 'unknown';
}
