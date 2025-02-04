import { VercelRequest, VercelResponse } from '@vercel/node';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

export function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Received authorization:', req.headers.authorization);
  console.log('Expected authorization:', `Bearer ${process.env.CRON_SECRET}`);
  
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized - Invalid secret');
  }
  res.status(200).end('Hello Cron!');
}

// Wrapper to add .status() method to native response object
function wrapResponse(res: http.ServerResponse): VercelResponse {
  const wrappedRes = res as VercelResponse;
  wrappedRes.status = function (statusCode: number) {
    this.statusCode = statusCode;
    return this;
  };
  return wrappedRes;
}

// Add local development server
if (require.main === module) {
  const server = http.createServer((req, res) => {
    const wrappedRes = wrapResponse(res);
    handler(req as any, wrappedRes);
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Development server running on http://localhost:${port}`);
  });
}

export default handler;
