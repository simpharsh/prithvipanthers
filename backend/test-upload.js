const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU0OTQ3OTUsImV4cCI6MTc3NTUzNzk5NX0.wjRLv0r31G-MukgvCBxf742XjQWKnQ6D_uX2YKuq12E';

// Create a test image file
const testImagePath = './test-image.jpg';
if (!fs.existsSync(testImagePath)) {
  const buffer = Buffer.alloc(1000);
  fs.writeFileSync(testImagePath, buffer);
}

const form = new FormData();
form.append('image', fs.createReadStream(testImagePath));

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/gallery',
  method: 'POST',
  headers: {
    ...form.getHeaders(),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {data += chunk;});
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
  process.exit(1);
});

form.pipe(req);
