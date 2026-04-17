const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (!API_BASE_URL) {
    return normalizedPath;
  }

  // Ensure the base URL has a protocol
  let base = API_BASE_URL.trim();
  if (base && !base.startsWith('http://') && !base.startsWith('https://')) {
    // If it looks like a domain but lacks protocol, add https://
    base = `https://${base}`;
  }

  // Remove trailing slash
  base = base.endsWith('/') ? base.slice(0, -1) : base;
  
  const finalUrl = `${base}${normalizedPath}`;
  return finalUrl;
};

const config = {
  API_BASE_URL,
  buildApiUrl
};

export default config;
