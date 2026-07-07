const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/proxy') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
    return;
  }

  let raw = '';
  req.on('data', chunk => raw += chunk);
  req.on('end', async () => {
    try {
      const { url, headers: reqHeaders, body } = JSON.parse(raw);
      console.log('\n--- PROXY REQ ---');
      console.log('Target:', url);

      if (!url) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing url' }));
        return;
      }

      const fwdHeaders = { ...reqHeaders };
      delete fwdHeaders['host'];
      delete fwdHeaders['Host'];
      delete fwdHeaders['connection'];
      delete fwdHeaders['Connection'];

      const bodyStr = JSON.stringify(body);

      const response = await fetch(url, {
        method: 'POST',
        headers: fwdHeaders,
        body: bodyStr,
        signal: AbortSignal.timeout(300000),
      });

      const data = await response.arrayBuffer();
      console.log('Upstream status:', response.status);

      const contentType = response.headers.get('content-type') || 'application/json';
      res.statusCode = response.status;
      res.setHeader('Content-Type', contentType);
      res.end(Buffer.from(data));
    } catch (err) {
      console.log('Proxy error:', err.message);
      res.statusCode = err.name === 'TimeoutError' ? 504 : 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`✓ Proxy server running on http://localhost:${PORT}`);
});
