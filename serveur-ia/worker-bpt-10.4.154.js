/* BPT 10.4.154 — Worker d'analyse de jetons (Cloudflare). Remplace le code existant : Edit code → coller → Deploy.
   Secret GEMINI_API_KEY, variables ALLOWED_ORIGINS / GEMINI_MODEL / USER_LIMIT / GLOBAL_LIMIT et liaison KV QUOTA inchangés.
   Nouveau (facultatif) : variable GEMINI_FALLBACK_MODEL = modèle de secours essayé une fois si le principal est saturé (429/503).
   Protocole de l'appli (inchangé) :
   entrée {image, requestedFormat:'counts', referenceSheets?:{moonriver?:base64 jpeg, palace?:base64 jpeg}}
   sortie {counts:{green,blue,black,purple,yellow,pink,orange}, jetons:[{c,x,y}], certitude, jeuDetecte, timing}
   erreurs {error:{code,message,upstreamStatus}} : le message dit la VRAIE cause (visible dans l'appli).
   GET /health : diagnostic sans photo ni appel Gemini.
   GET /health?probe=1 (en-tête Authorization Firebase) : cherche le réglage accepté par le modèle avec une demande
   minuscule sans photo, le mémorise et renvoie le détail de chaque essai. Compte dans la limite du jour.

   10.4.154 — Réglage appris : Google refuse certains formats selon le modèle (ex. gemini-3.8-flash : 400 « invalid argument »).
   Le Worker essaie les réglages du plus rapide au plus simple, retient celui qui passe (mémoire + KV 7 jours, par modèle)
   et repart directement de lui ensuite. Plus de série d'essais refusés à chaque photo. Message d'erreur complet. */
const VERSION = '10.4.154';
const PROJECT_ID = 'bpt-championship';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const KEYS = ['green', 'blue', 'black', 'purple', 'yellow', 'pink', 'orange'];
const COMMON =
  "Recense les jetons de poker de la photo UN PAR UN : une entrée dans jetons par jeton, avec c = clé couleur et x,y = centre du jeton sur la photo (0 à 1000, x vers la droite, y vers le bas). " +
  "Parcours la photo de gauche à droite puis de haut en bas pour ne rien oublier ni compter deux fois. Un jeton à plat = un disque complet = UNE entrée (son anneau/bord et ses motifs ne sont pas d'autres jetons). " +
  "Dans une pile, une entrée par tranche visible (pile de côté ou de trois quarts), y compris une tranche à moitié cachée si tu es sûr ; le dessus de la pile n'est pas une tranche en plus. " +
  "Ignore tout ce qui n'est pas un jeton (table, cartes, mains, reflets, ombres, jetons flous au loin). ";
const REFS = " Les images suivantes sont des planches de référence : un jeton type par valeur avec le nom du jeu et la valeur écrits. Compare la teinte EXACTE de chaque jeton à ces vignettes avant de décider.";
const PROMPT = COMMON +
  "Le jeu de jetons est inconnu : reconnais-le toi-même, jeton par jeton. Deux jeux existent. " +
  "(A) MOON RIVER / East River : anneau blanc à motifs de lune. vert=green(25) ; BLEU franc sombre et saturé=blue(50) ; noir=black(100) ; violet=purple(500) ; jaune=yellow(1000) ; rose=pink(5000) ; orange OU BLEU CLAIR pastel/ciel (nettement plus lumineux que le 50)=orange(10000). " +
  "Le bleu clair n'est JAMAIS blue : il vaut 10000. La valeur imprimée prime sur la couleur quand elle est lisible. " +
  "(B) CHIPS PALACE : bord LAS VEGAS NEVADA USA, bord BICOLORE (corps dominant + pastilles/inserts rectangulaires) ; la valeur dépend de la couleur du CORPS, pas des pastilles : " +
  "vert/marron=green(25) ; bleu/blanc=blue(50) ; noir/mauve=black(100) ; violet/blanc=purple(500) ; jaune/bleu=yellow(1000) ; marron/vert=pink(5000) ; rouge/blanc=orange(10000). Vert à pastilles marron (25) ≠ marron à pastilles vertes (5000). " +
  "Identifie le jeu de chaque jeton d'après son bord et ses motifs, puis applique la bonne table. En cas de doute entre deux valeurs voisines (50 / 10000 surtout), compare la luminosité aux autres jetons bleus de la photo et aux références, puis baisse la certitude.";
const FORMAT = ' Format exact : {"jeuDetecte":"moonriver|palace|indetermine","jetons":[{"c":"green","x":120,"y":340}],"certitude":"haute|moyenne|basse"}';
// Schéma au format OpenAPI de Gemini (responseSchema)…
const SCHEMA_OPENAPI = {
  type: 'OBJECT',
  properties: {
    jeuDetecte: { type: 'STRING', enum: ['moonriver', 'palace', 'indetermine'] },
    jetons: { type: 'ARRAY', items: { type: 'OBJECT', properties: { c: { type: 'STRING', enum: KEYS }, x: { type: 'INTEGER' }, y: { type: 'INTEGER' } }, required: ['c', 'x', 'y'] } },
    certitude: { type: 'STRING', enum: ['haute', 'moyenne', 'basse'] }
  },
  required: ['jeuDetecte', 'jetons', 'certitude']
};
// … et au format JSON Schema standard (responseJsonSchema), accepté par les modèles récents.
const SCHEMA_JSON = {
  type: 'object',
  properties: {
    jeuDetecte: { type: 'string', enum: ['moonriver', 'palace', 'indetermine'] },
    jetons: { type: 'array', items: { type: 'object', properties: { c: { type: 'string', enum: KEYS }, x: { type: 'integer' }, y: { type: 'integer' } }, required: ['c', 'x', 'y'] } },
    certitude: { type: 'string', enum: ['haute', 'moyenne', 'basse'] }
  },
  required: ['jeuDetecte', 'jetons', 'certitude']
};
// Réglages essayés, du plus rapide (format imposé + réflexion minimale) au plus simple (aucun réglage).
const VARIANTS = [
  { id: 'json+min', schema: 'json', think: { thinkingLevel: 'minimal' } },
  { id: 'json+low', schema: 'json', think: { thinkingLevel: 'low' } },
  { id: 'json', schema: 'json', think: null },
  { id: 'openapi+min', schema: 'openapi', think: { thinkingLevel: 'minimal' } },
  { id: 'openapi+b0', schema: 'openapi', think: { thinkingBudget: 0 } },
  { id: 'openapi', schema: 'openapi', think: null },
  { id: 'texte+min', schema: null, think: { thinkingLevel: 'minimal' } },
  { id: 'texte+b0', schema: null, think: { thinkingBudget: 0 } },
  { id: 'texte', schema: null, think: null }
];
const SCAN_BUDGET_MS = 22000; // l'appli abandonne à 35 s : ne pas chercher plus longtemps
const learned = {}; // modèle → index du réglage accepté (mémoire de l'isolat)
let jwksCache = { at: 0, keys: null };
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
const json = (o, status, cors) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...cors } });
const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);

function corsHeaders(req, env) {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.get('origin') || '';
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'access-control-allow-origin': ok ? (allowed.includes('*') ? '*' : origin) : allowed[0],
    'access-control-allow-headers': 'authorization,content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-max-age': '86400', // le navigateur ne refait pas le preflight pendant 24 h
    'vary': 'origin'
  };
}
async function getKeys(fetchFn) {
  if (jwksCache.keys && Date.now() - jwksCache.at < 3600e3) return jwksCache.keys;
  const r = await fetchFn(JWKS_URL); if (!r.ok) throw new Error('jwks');
  jwksCache = { at: Date.now(), keys: (await r.json()).keys }; return jwksCache.keys;
}
export async function verifyFirebaseToken(token, fetchFn = fetch) {
  const parts = String(token || '').split('.'); if (parts.length !== 3) throw new Error('format');
  const header = JSON.parse(new TextDecoder().decode(b64u(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(b64u(parts[1])));
  if (header.alg !== 'RS256') throw new Error('alg');
  const jwk = (await getKeys(fetchFn)).find(k => k.kid === header.kid); if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  const now = Math.floor(Date.now() / 1000);
  if (!ok || claims.aud !== PROJECT_ID || claims.iss !== 'https://securetoken.google.com/' + PROJECT_ID || !claims.sub || claims.exp < now || claims.iat > now + 300) throw new Error('claims');
  return claims.sub;
}
async function bump(env, key, limit) {
  if (!env.QUOTA) return true;
  const n = parseInt(await env.QUOTA.get(key) || '0', 10);
  if (n >= limit) return false;
  await env.QUOTA.put(key, String(n + 1), { expirationTtl: 172800 });
  return true;
}
async function getLearned(env, model) {
  if (Number.isInteger(learned[model])) return learned[model];
  if (!env.QUOTA) return -1;
  try { const v = parseInt(await env.QUOTA.get('cfg:' + model) || '', 10); if (v >= 0 && v < VARIANTS.length) { learned[model] = v; return v; } } catch (_) { /* KV indisponible : on cherche */ }
  return -1;
}
async function setLearned(env, model, i) {
  if (learned[model] === i) return;
  learned[model] = i;
  if (env.QUOTA) { try { await env.QUOTA.put('cfg:' + model, String(i), { expirationTtl: 604800 }); } catch (_) { /* sans gravité */ } }
}
async function forgetLearned(env, model) {
  delete learned[model];
  if (env.QUOTA) { try { await env.QUOTA.delete('cfg:' + model); } catch (_) { /* sans gravité */ } }
}
function geminiRequest(env, model, parts, variant, fetchFn) {
  const gen = { temperature: 0, maxOutputTokens: 3000, responseMimeType: 'application/json' };
  if (variant.schema === 'json') gen.responseJsonSchema = SCHEMA_JSON;
  if (variant.schema === 'openapi') gen.responseSchema = SCHEMA_OPENAPI;
  if (variant.think) gen.thinkingConfig = variant.think;
  const text = parts.text + (variant.schema ? '' : FORMAT);
  return fetchFn('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [...parts.media, { text }] }], generationConfig: gen })
  });
}
// Appelle le modèle en partant du réglage appris ; sur un 400, essaie les réglages suivants (dans le budget de temps).
async function callModel(env, model, parts, fetchFn, attempts, t0) {
  const known = await getLearned(env, model);
  const order = known >= 0 ? [known, ...VARIANTS.keys()].filter((v, k, a) => a.indexOf(v) === k) : [...VARIANTS.keys()];
  let last = null;
  for (const i of order) {
    if (attempts.length && Date.now() - t0 > SCAN_BUDGET_MS) break;
    const v = VARIANTS[i], ta = Date.now();
    const r = await geminiRequest(env, model, parts, v, fetchFn);
    const j = await r.json().catch(() => ({}));
    const msg = r.ok ? '' : clip((j.error && j.error.message) || ('HTTP ' + r.status), 300);
    attempts.push({ model, variant: v.id, status: r.status, ms: Date.now() - ta, ...(msg ? { message: msg } : {}) });
    last = { r, j, variant: v, model };
    if (r.ok) { await setLearned(env, model, i); return last; }
    if (r.status !== 400) return last; // quota, saturation, clé, modèle inconnu : changer de réglage n'y fera rien
    if (i === known) await forgetLearned(env, model); // le modèle a changé de règles : on réapprend
  }
  return last;
}
async function callGemini(env, parts, fetchFn, attempts, t0) {
  const model = env.GEMINI_MODEL || 'gemini-flash-latest';
  let res = await callModel(env, model, parts, fetchFn, attempts, t0);
  const fb = env.GEMINI_FALLBACK_MODEL;
  if (fb && fb !== model && res && [429, 500, 503, 504].includes(res.r.status) && Date.now() - t0 < SCAN_BUDGET_MS) {
    res = await callModel(env, fb, parts, fetchFn, attempts, t0);
  }
  return res;
}
function summary(attempts) {
  return attempts.map(a => a.model.replace(/^gemini-/, '') + '/' + a.variant + ' ' + a.status).join(', ');
}
const err = (code, message, status, cors, extra) => json({ error: { code, message, ...(extra || {}) } }, status, cors);

async function authenticate(req, fetchFn) {
  return verifyFirebaseToken((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''), fetchFn);
}
async function quotas(env, uid) {
  const day = new Date().toISOString().slice(0, 10);
  if (!(await bump(env, 'u:' + uid + ':' + day, Number(env.USER_LIMIT || 40)))) return 'QUOTA_USER';
  if (!(await bump(env, 'g:' + day, Number(env.GLOBAL_LIMIT || 400)))) return 'QUOTA_CLUB';
  return '';
}
const QUOTA_MSG = { QUOTA_USER: 'Limite quotidienne atteinte pour ton compte', QUOTA_CLUB: 'Limite quotidienne du club atteinte' };

export default {
  async fetch(req, env, ctx, fetchFn = fetch) {
    const t0 = Date.now(), cors = corsHeaders(req, env);
    try {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (req.method === 'GET') {
        const u = new URL(req.url);
        if (u.pathname !== '/health') return err('POST_ONLY', 'POST uniquement', 405, cors);
        const model = env.GEMINI_MODEL || 'gemini-flash-latest';
        const base = { ok: true, version: VERSION, secretGemini: !!env.GEMINI_API_KEY, origins: (env.ALLOWED_ORIGINS || '*'), quotaKV: !!env.QUOTA, model, fallback: env.GEMINI_FALLBACK_MODEL || null };
        const known = await getLearned(env, model);
        base.learned = known >= 0 ? VARIANTS[known].id : null;
        if (u.searchParams.get('probe') !== '1') return json(base, 200, cors);
        if (!env.GEMINI_API_KEY) return err('NO_KEY', 'Secret GEMINI_API_KEY absent du Worker', 500, cors);
        let uid; try { uid = await authenticate(req, fetchFn); } catch (_) { return err('AUTH', 'Connexion Firebase requise pour le test', 401, cors); }
        const q = await quotas(env, uid); if (q) return err(q, QUOTA_MSG[q], 429, cors);
        await forgetLearned(env, model);
        const attempts = [];
        const res = await callGemini(env, { media: [], text: 'Test technique sans photo : aucun jeton, jetons = liste vide, jeuDetecte = indetermine, certitude = basse.' }, fetchFn, attempts, t0);
        return json({ ...base, learned: res && res.r.ok ? res.variant.id : null, probeOk: !!(res && res.r.ok), attempts, totalMs: Date.now() - t0 }, 200, cors);
      }
      if (req.method !== 'POST') return err('POST_ONLY', 'POST uniquement', 405, cors);
      if (!env.GEMINI_API_KEY) return err('NO_KEY', 'Secret GEMINI_API_KEY absent du Worker', 500, cors);
      let uid;
      try { uid = await authenticate(req, fetchFn); }
      catch (e) { return err('AUTH', 'Connexion Firebase requise', 401, cors); }
      if (Number(req.headers.get('content-length') || 0) > 9e6) return err('TOO_BIG', 'Photo trop lourde', 413, cors);
      let body; try { body = await req.json(); } catch (_) { return err('BAD_JSON', 'JSON invalide', 400, cors); }
      const img = body && body.image, B64 = /^[A-Za-z0-9+/=]+$/;
      if (typeof img !== 'string' || img.length < 100 || img.length > 6e6 || !B64.test(img)) return err('BAD_IMAGE', 'Image invalide', 400, cors);
      const rs = body.referenceSheets && typeof body.referenceSheets === 'object' ? body.referenceSheets : {};
      const sheets = ['moonriver', 'palace'].map(k => rs[k]).filter(v => typeof v === 'string' && v.length > 100 && v.length < 1.5e6 && B64.test(v));
      const q = await quotas(env, uid); if (q) return err(q, QUOTA_MSG[q], 429, cors);
      const parts = {
        media: [{ inline_data: { mime_type: 'image/jpeg', data: img } }, ...sheets.map(sh => ({ inline_data: { mime_type: 'image/jpeg', data: sh } }))],
        text: PROMPT + (sheets.length ? REFS : '') + ' Réponds uniquement en JSON. jeuDetecte = jeu reconnu sur la photo.'
      };
      const t1 = Date.now(), attempts = [];
      let res;
      try { res = await callGemini(env, parts, fetchFn, attempts, t0); }
      catch (e) { console.log('BPT gemini réseau', clip(e && e.message, 200)); return err('GEMINI_NETWORK', 'Connexion à Gemini impossible : ' + clip(e && e.message, 120), 502, cors); }
      const geminiMs = Date.now() - t1;
      if (!res || !res.r.ok) {
        const st = res ? res.r.status : 0, m = res ? (res.j.error && res.j.error.message) || ('Erreur Gemini ' + st) : 'aucune réponse';
        console.log('BPT gemini erreur', JSON.stringify(attempts));
        // Le message principal d'abord (l'appli en affiche ~220 caractères), puis le détail des essais.
        return err('GEMINI_UPSTREAM', 'Gemini ' + st + ' : ' + clip(m, 160) + ' [essais : ' + summary(attempts) + ']', st === 429 ? 429 : 502, cors, { upstreamStatus: st, attempts });
      }
      const c = (res.j.candidates || [])[0];
      const text = c && c.content && c.content.parts ? c.content.parts.filter(p => !p.thought).map(p => p.text || '').join('') : '';
      let o; try { o = JSON.parse(text); } catch (_) { const m = String(text).match(/\{[\s\S]*\}/); try { o = m && JSON.parse(m[0]); } catch (__) { o = null; } }
      if (!o) {
        const why = (c && c.finishReason) || (res.j.promptFeedback && res.j.promptFeedback.blockReason) || 'réponse vide';
        console.log('BPT réponse illisible', why, clip(text, 200));
        return err('GEMINI_UNREADABLE', 'Réponse IA illisible (' + why + ')', 502, cors);
      }
      const list = Array.isArray(o.jetons) ? o.jetons : null;
      if (!list || list.length > 300) return err('GEMINI_VALUE', 'Réponse IA incohérente (liste de jetons)', 502, cors);
      const counts = {}; KEYS.forEach(k => counts[k] = 0);
      const jetons = [];
      const cl = v => Math.max(0, Math.min(1000, Math.round(Number(v) || 0)));
      for (const it of list) {
        if (!it || !KEYS.includes(it.c)) continue;
        counts[it.c]++;
        jetons.push({ c: it.c, x: cl(it.x), y: cl(it.y) });
      }
      return json({
        counts, jetons,
        certitude: ['haute', 'moyenne', 'basse'].includes(o.certitude) ? o.certitude : 'moyenne',
        jeuDetecte: ['moonriver', 'palace', 'indetermine'].includes(o.jeuDetecte) ? o.jeuDetecte : 'indetermine',
        timing: { geminiMs, totalMs: Date.now() - t0, model: res.model, variant: res.variant.id, essais: attempts.length, sheets: sheets.length }
      }, 200, cors);
    } catch (e) {
      console.log('BPT exception', clip(e && e.stack || e, 400));
      return err('WORKER_EXCEPTION', 'Exception Worker : ' + clip(e && e.message || e, 160), 500, cors);
    }
  }
};
