import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import httpProxy from 'http-proxy'

const CONFIG_FILE = path.resolve('./proxy-config.json')

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

const proxy = httpProxy.createProxyServer({ changeOrigin: true });
proxy.on('error', (err, req, res) => {
  res.writeHead(502, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Service unreachable', detail: err.message }));
});

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dynamic-proxy',
      configureServer(server) {
        // GET/POST /api/config — read/write proxy-config.json
        server.middlewares.use('/api/config', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') {
            res.end(fs.readFileSync(CONFIG_FILE, 'utf8'));
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', d => body += d);
            req.on('end', () => {
              fs.writeFileSync(CONFIG_FILE, JSON.stringify(JSON.parse(body), null, 2));
              res.end('{"ok":true}');
            });
          }
        });

        // Dynamic proxy: reads config on every request — no restart needed
        server.middlewares.use('/proxy', (req, res) => {
          const parts = req.url.match(/^\/([^/]+)(\/.*)?$/); // /serviceName/rest
          if (!parts) { res.writeHead(400); res.end('Bad proxy path'); return; }

          const service = parts[1];
          const cfg = readConfig();
          const s = cfg[service];
          if (!s) { res.writeHead(404); res.end(`Unknown service: ${service}`); return; }

          req.url = parts[2] || '/';
          proxy.web(req, res, { target: `http://${s.ip}:${s.port}` });
        });
      }
    }
  ],
  server: { host: true }
})
