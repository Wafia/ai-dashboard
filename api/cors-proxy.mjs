const NVIDIA_API = 'https://integrate.api.nvidia.com/v1/chat/completions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fwdHeaders = {};
    const auth = req.headers['authorization'];
    if (auth) fwdHeaders['Authorization'] = auth;
    fwdHeaders['Content-Type'] = 'application/json';

    const response = await fetch(NVIDIA_API, {
      method: 'POST',
      headers: fwdHeaders,
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(300000),
    });

    const data = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/json';

    res.setHeader('Content-Type', contentType);
    return res.status(response.status).send(Buffer.from(data));
  } catch (err) {
    const status = err.name === 'TimeoutError' ? 504 : 500;
    return res.status(status).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
}
