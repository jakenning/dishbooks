// Tiny static server for the animations workspace (fetching scenario JSON
// needs http://, not file://). Used by the preview and by render.mjs.
//
//   node animations/serve.mjs            # http://localhost:5178
//   PORT=6000 node animations/serve.mjs

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = dirname(fileURLToPath(import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

export async function listScenes() {
  const entries = await readdir(join(ROOT, 'scenes'), { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

export async function listScenarios() {
  return (await readdir(join(ROOT, 'scenarios'))).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
}

export function serve(port = 0) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let path = decodeURIComponent(url.pathname);
    if (path === '/api/index') {
      res.writeHead(200, { 'content-type': TYPES['.json'] });
      res.end(JSON.stringify({ scenes: await listScenes(), scenarios: await listScenarios() }));
      return;
    }
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await serve(Number(process.env.PORT) || 5178);
  console.log(`Animations workspace → http://localhost:${server.address().port}/`);
}
