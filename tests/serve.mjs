// Foreground, loopback-only static server for production-build browser tests.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const name = decodeURIComponent(url.pathname);
    const file = resolve(root, `.${name.endsWith('/') ? `${name}index.html` : name}`);
    if (!file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(4323, '127.0.0.1');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
