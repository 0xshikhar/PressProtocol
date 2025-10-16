/**
 * Backend API Configuration
 * Automatically switches between production and development URLs
 */

// Production backend URL (Railway deployment)
const PRODUCTION_BACKEND_URL = "https://anonpress-production.up.railway.app";

// Development backend URL (local)
const DEVELOPMENT_BACKEND_URL = "http://localhost:4000";

/**
 * Get the backend API URL based on environment
 * Priority:
 * 1. Environment variable (NEXT_PUBLIC_BACKEND_API_URL)
 * 2. Production URL (if NODE_ENV === 'production')
 * 3. Development URL (default)
 */
export function getBackendUrl(): string {
  // Check if environment variable is set
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL;
  }

  // Use production URL in production environment
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_BACKEND_URL;
  }

  // Default to development URL
  return DEVELOPMENT_BACKEND_URL;
}

/**
 * Backend API URL - use this throughout the application
 */
export const BACKEND_URL = getBackendUrl();

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === "production";
