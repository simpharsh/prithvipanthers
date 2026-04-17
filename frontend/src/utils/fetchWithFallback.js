import { buildApiUrl } from '../config.js';

// Simple in-memory cache for GET requests
const fetchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resilient fetch wrapper with centralized API URL support and simple caching.
 * Works with both GET and POST requests.
 */
export const fetchWithFallback = async (endpoint, options = {}) => {
  const expectJson = options.expectJson !== false;
  const useCache = options.method === 'GET' || !options.method;
  const url = buildApiUrl(endpoint);

  // Check cache for GET requests
  if (useCache) {
    const cached = fetchCache.get(url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      // Return a cloned response so it can be read multiple times if needed
      return cached.response.clone();
    }
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Request failed (${response.status}) for ${url}: ${errorText.slice(0, 200)}`);
    }

    if (expectJson) {
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        const responsePreview = await response.text().catch(() => '');
        throw new Error(
          `Expected JSON but got ${contentType || 'unknown content-type'} from ${url}. ` +
          `Response starts with: ${responsePreview.slice(0, 120)}`
        );
      }
    }

    // Cache the successful GET response
    if (useCache) {
      fetchCache.set(url, {
        response: response.clone(),
        timestamp: Date.now()
      });
    }

    return response;
  } catch (error) {
    throw error;
  }
};
