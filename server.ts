import http from 'http';
import { handler } from './api/cron';

const server = http.createServer((req, res) => {
  if (req.url === '/api/cron' && req.headers['cron-secret'] === process.env.CRON_SECRET) {
    return handler(req as any, res as any);
  }
  res.writeHead(404);
  res.end('Not found');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Development server running on http://localhost:${port}`);
});
