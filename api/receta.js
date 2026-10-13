// Página pública de una receta con schema.org/Recipe (JSON-LD), para el
// "Importar receta" de Cookidoo. Usa la versión TM7 si existe; si no, los pasos originales.
const SB_URL = 'https://jmkvphayyhwzootlybde.supabase.co/rest/v1';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impta3ZwaGF5eWh3em9vdGx5YmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODE3ODEsImV4cCI6MjA5MzU1Nzc4MX0.EP2vv5avU1FIXlZn4jFo3QkvqnxOdLOrICqNV8qAZxM';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iso = min => `PT${Math.max(0, Math.round(min || 0))}M`;

export default async function handler(req, res) {
  const id = String(req.query.id || '');
  if (!/^[\w-]+$/.test(id)) return res.status(400).send('id inválido');
  const r = await fetch(`${SB_URL}/recipes?id=eq.${id}&select=*`, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
  const [recipe] = r.ok ? await r.json() : [];
  if (!recipe) return res.status(404).send('Receta no encontrada');

  const tm7 = recipe.tm7;
  const ingredients = tm7
    ? tm7.ingredientes
    : (recipe.steps || []).flatMap(s => (s.ingredients || []).map(i => `${i.quantity} ${i.unit} ${i.name}`));
  const steps = tm7
    ? tm7.pasos.map(p => p.texto)
    : (recipe.steps || []).map(s => `${s.name}: ${s.method || ''}`);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    recipeCategory: recipe.category,
    recipeYield: `${tm7?.porciones || recipe.portions || 1} porciones`,
    ...(tm7 ? { prepTime: iso(tm7.prepMin), totalTime: iso(tm7.totalMin), tool: ['Thermomix TM7'] } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: steps.map(text => ({ '@type': 'HowToStep', text })),
  };

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(recipe.name)}</title>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>body{font:15px/1.7 system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 16px;color:#17150F;background:#F3F1EC}h1{font-size:26px}li{margin:6px 0}</style>
</head><body><h1>${esc(recipe.name)}</h1>
<h2>Ingredientes</h2><ul>${ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
<h2>Preparación</h2><ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
</body></html>`);
}
