// Verifica la clave de la portada y deja la cookie de sesión (30 días).
// Mismo token que calcula middleware.js: sha256("mep-v1:" + clave).
import { createHash, timingSafeEqual } from 'node:crypto';

const sha = s => createHash('sha256').update(s).digest();
const MAX_AGE = 60 * 60 * 24 * 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const wantsJson = (req.headers.accept || '').includes('application/json');
  const password = process.env.MEP_PASSWORD;
  const given = String(req.body?.clave || '');

  const ok = !!password && timingSafeEqual(sha(given), sha(password));
  if (!ok) {
    await new Promise(r => setTimeout(r, 700));
    if (wantsJson) return res.status(401).json({ ok: false, error: password ? 'clave' : 'sin-configurar' });
    return res.redirect(303, '/?clave=mal');
  }

  const token = sha('mep-v1:' + password).toString('hex');
  res.setHeader('Set-Cookie', `mep_s=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
  if (wantsJson) return res.status(200).json({ ok: true });
  return res.redirect(303, '/');
}
