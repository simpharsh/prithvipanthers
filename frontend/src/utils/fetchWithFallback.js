import { buildApiUrl } from '../config.js';

/**
 * Resilient fetch wrapper with centralized API URL support.
 * Works with both GET and POST requests.
 */
export const fetchWithFallback = async (endpoint, options = {}) => {
  const expectJson = options.expectJson !== false;
  const url = buildApiUrl(endpoint);

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

    return response;
  } catch (error) {
    throw error;
  }
};
