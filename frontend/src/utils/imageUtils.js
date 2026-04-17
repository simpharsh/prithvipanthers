/**
 * Utilities for consistent image handling across the application.
 */

/**
 * Resolves a raw image path/URL from various possible property names.
 * Handles relative paths by ensuring they start with a slash.
 */
export const resolveImageUrl = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  
  const rawPath = item.image_url || item.imageUrl || item.url || item.image_id || item.imageId || '';
  if (!rawPath || typeof rawPath !== 'string') return '';
  
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
  if (rawPath.startsWith('data:')) return rawPath;
  
  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
};

/**
 * Normalizes an array of images from API responses.
 * Filters out inactive items and extracts image URLs.
 */
export const normalizeImages = (data) => {
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.gallery)
      ? data.gallery
      : Array.isArray(data?.images)
        ? data.images
        : [];

  return items
    .filter((item) => item?.is_active !== false && resolveImageUrl(item))
    .map(resolveImageUrl);
};
