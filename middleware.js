// Clave de acceso: sin la cookie correcta no se sirve la app ni la API de IA.
// La clave vive en la variable de entorno MEP_PASSWORD de Vercel. Si falta, todo queda cerrado.
// Quedan públicos: la portada (/acceso.html), el login y la página de receta para Cookidoo.
export const config = {
  matcher: ['/((?!acceso\\.html|api/login|api/receta|favicon).*)'],
};

const COOKIE = 'mep_s';

async function tokenFor(password) {
  const data = new TextEncoder().encode('mep-v1:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  const hit = raw.split(/;\s*/).find(c => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

export default async function middleware(request) {
  const password = process.env.MEP_PASSWORD;
  const ok = password && cookieValue(request, COOKIE) === (await tokenFor(password));
  if (ok) return new Response(null, { headers: { 'x-middleware-next': '1' } });

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Acceso restringido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/acceso.html', url).toString() } });
}
