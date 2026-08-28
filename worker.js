export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const isApiRequest = pathname === '/api' || pathname.startsWith('/api/');

    // Allow Firebase/Firestore API calls to pass through
    if (url.hostname.includes('firebase') || url.hostname.includes('googleapis.com')) {
      return fetch(request);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }

      if (isApiRequest) {
        return new Response('Not Found', { status: 404 });
      }

      if (!pathname.includes('.') && pathname !== '/favicon.ico') {
        const fallbackUrl = new URL('/index.html', url);
        return env.ASSETS.fetch(new Request(fallbackUrl, request));
      }

      return assetResponse;
    }

    if (isApiRequest) {
      return new Response('Not Found', { status: 404 });
    }

    // Every extensionless URL belongs to the client-side application. This is
    // important on refresh because the browser requests the nested URL first.
    if (pathname.includes('.') && pathname !== '/favicon.ico') {
      return new Response('Not Found', { status: 404 });
    }

    return new Response(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>SOVANEX</title>
        </head>
        <body style="margin:0;background:#0A0A0A;color:white;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;">
          <div style="text-align:center;">
            <h1 style="margin-bottom:12px;letter-spacing:0.2em;">SOVANEX</h1>
            <p style="opacity:0.8;">Reloading the boutique...</p>
          </div>
          <script>
            const target = location.pathname === '/' ? '/' : '/';
            if (window.location.pathname !== target) {
              window.location.replace(target + window.location.search + window.location.hash);
            }
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  },
};
