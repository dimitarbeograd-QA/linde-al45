// Минимален статичен сървър за index.html — приложението е self-contained
// (inline CSS/JS/base64 изображение), затова не са нужни допълнителни assets.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '..', 'index.html');
const port = process.env.PORT || 4173;

const server = http.createServer((req, res) => {
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Failed to read index.html');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Static server listening on http://localhost:${port}`);
});
