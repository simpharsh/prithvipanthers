const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (!API_BASE_URL) {
    return normalizedPath;
  }

  // Ensure no double slashes
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${normalizedPath}`;
};

const config = {
  API_BASE_URL,
  buildApiUrl
};

export default config;
