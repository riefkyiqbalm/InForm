/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ── Flask endpoints (BG-AI/log/main.py) ──────────────────────────────
      // IMPORTANT: Do NOT use '/api/chat/:path*' wildcard here.
      // That would intercept /api/chat/sessions/... which are Next.js routes,
      // forwarding them to Flask (which has no such path) → 404 HTML → crash.
      //
      // Flask only exposes these four exact routes.
      // The messages route calls Flask directly inside the route handler
      // (server-to-server), so no rewrite is needed for it.
      {
        source:      '/api/flask/chat',
        destination: 'http://127.0.0.1:5000/api/chat',
      },
      {
        source:      '/api/flask/status',
        destination: 'http://127.0.0.1:5000/api/status',
      },
      {
        source:      '/api/flask/models',
        destination: 'http://127.0.0.1:5000/api/models',
      },
      {
        source:      '/api/flask/config',
        destination: 'http://127.0.0.1:5000/api/config',
      },
    ];
  },
};

module.exports = nextConfig;