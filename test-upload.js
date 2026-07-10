const http = require('http');

const boundary = '----FormBoundary123';
const body = [
  `------FormBoundary123`,
  `Content-Disposition: form-data; name="file"; filename="test.png"`,
  `Content-Type: image/png`,
  ``,
  `fakepngdata`,
  `------FormBoundary123--`,
  ``
].join('\r\n');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/upload?folder=test',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=----FormBoundary123`,
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
});

req.on('error', (e) => console.log('ERROR:', e.message));
req.write(body);
req.end();
