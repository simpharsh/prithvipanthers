export const allowCors = (req, res) => {
  const allowedOrigins = [
    'https://prithvipanthers.com',
    'https://www.prithvipanthers.com',
    'https://test.pruthvipanthers.com',
    'https://pruthvi-panther.vercel.app',
    'http://localhost:3000'
  ];
  
  const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
  const allAllowed = [...new Set([...allowedOrigins, ...envOrigins])];

  const origin = req.headers.origin;

  if (allAllowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-filename');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
};
