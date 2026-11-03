/* BPT 10.4.153 — Worker d'analyse de jetons (Cloudflare). Remplace le code existant : Edit code → coller → Deploy.
   Secret GEMINI_API_KEY et variables ALLOWED_ORIGINS inchangés. Protocole de l'appli 10.4.149 :
   entrée {image, requestedFormat:'counts', chipSet:'moonriver'|'palace', referenceSheet?:base64 jpeg}
   sortie {counts:{green,blue,black,purple,yellow,pink,orange}, certitude, jeuDetecte, timing}
   erreurs {error:{code,message,upstreamStatus}} : le message dit la VRAIE cause (visible dans l'appli).
   GET /health : diagnostic sans photo. */
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
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    jetons: { type: 'ARRAY', maxItems: 150, items: { type: 'OBJECT', properties: { c: { type: 'STRING', enum: KEYS }, x: { type: 'INTEGER' }, y: { type: 'INTEGER' } }, required: ['c', 'x', 'y'], propertyOrdering: ['c', 'x', 'y'] } },
    certitude: { type: 'STRING', enum: ['haute', 'moyenne', 'basse'] },
    jeuDetecte: { type: 'STRING', enum: ['moonriver', 'palace', 'indetermine'] }
  },
  required: ['jetons', 'certitude', 'jeuDetecte'],
  propertyOrdering: ['jeuDetecte', 'jetons', 'certitude']
};
const THINKING = [{ thinkingLevel: 'minimal' }, { thinkingBudget: 0 }, null];
let thinkingChoice = -1, jwksCache = { at: 0, keys: null };
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
const json = (o, status, cors) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...cors } });

function corsHeaders(req, env) {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.get('origin') || '';
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'access-control-allow-origin': ok ? (allowed.includes('*') ? '*' : origin) : allowed[0],
    'access-control-allow-headers': 'authorization,content-type',
    'access-control-allow-methods': 'POST,OPTIONS',
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
function gemini(env, img, sheets, think, fetchFn, noSchema) {
  const model = env.GEMINI_MODEL || 'gemini-flash-latest';
  const gen = { temperature: 0, maxOutputTokens: 4000, responseMimeType: 'application/json' };
  if (!noSchema) gen.responseSchema = SCHEMA;
  if (think) gen.thinkingConfig = think;
  let text = PROMPT + (sheets.length ? REFS : '');
  text += ' Réponds uniquement en JSON. jeuDetecte = jeu reconnu sur la photo.';
  if (noSchema) text += ' Format exact : {"jeuDetecte":"moonriver|palace|indetermine","jetons":[{"c":"green","x":120,"y":340}],"certitude":"haute|moyenne|basse"}';
  const parts = [{ inline_data: { mime_type: 'image/jpeg', data: img } }];
  sheets.forEach(sh => parts.push({ inline_data: { mime_type: 'image/jpeg', data: sh } }));
  parts.push({ text });
  return fetchFn('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: gen })
  });
}
async function callGemini(env, img, sheets, fetchFn) {
  let r, i = thinkingChoice >= 0 ? thinkingChoice : 0;
  for (; i < THINKING.length; i++) {
    r = await gemini(env, img, sheets, THINKING[i], fetchFn, false);
    if (r.status === 400 && thinkingChoice < 0 && i < THINKING.length - 1) continue;
    break;
  }
  if (r.ok) { thinkingChoice = i; return { r, schema: true }; }
  if (r.status === 400) { const r2 = await gemini(env, img, sheets, null, fetchFn, true); if (r2.ok) return { r: r2, schema: false }; }
  return { r, schema: true };
}
const err = (code, message, status, cors, upstreamStatus) => json({ error: { code, message, ...(upstreamStatus ? { upstreamStatus } : {}) } }, status, cors);
export default {
  async fetch(req, env, ctx, fetchFn = fetch) {
    const t0 = Date.now(), cors = corsHeaders(req, env);
    try {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (req.method === 'GET') {
        const u = new URL(req.url);
        if (u.pathname === '/health') return json({ ok: true, version: '10.4.153', secretGemini: !!env.GEMINI_API_KEY, origins: (env.ALLOWED_ORIGINS || '*'), quotaKV: !!env.QUOTA }, 200, cors);
        return err('POST_ONLY', 'POST uniquement', 405, cors);
      }
      if (req.method !== 'POST') return err('POST_ONLY', 'POST uniquement', 405, cors);
      if (!env.GEMINI_API_KEY) return err('NO_KEY', 'Secret GEMINI_API_KEY absent du Worker', 500, cors);
      let uid;
      try { uid = await verifyFirebaseToken((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''), fetchFn); }
      catch (e) { return err('AUTH', 'Connexion Firebase requise', 401, cors); }
      if (Number(req.headers.get('content-length') || 0) > 9e6) return err('TOO_BIG', 'Photo trop lourde', 413, cors);
      let body; try { body = await req.json(); } catch (_) { return err('BAD_JSON', 'JSON invalide', 400, cors); }
      const img = body && body.image, B64 = /^[A-Za-z0-9+/=]+$/;
      if (typeof img !== 'string' || img.length < 100 || img.length > 6e6 || !B64.test(img)) return err('BAD_IMAGE', 'Image invalide', 400, cors);
      const rs = body.referenceSheets && typeof body.referenceSheets === 'object' ? body.referenceSheets : {};
      const sheets = ['moonriver', 'palace'].map(k => rs[k]).filter(v => typeof v === 'string' && v.length > 100 && v.length < 1.5e6 && B64.test(v));
      const day = new Date().toISOString().slice(0, 10);
      if (!(await bump(env, 'u:' + uid + ':' + day, Number(env.USER_LIMIT || 40)))) return err('QUOTA_USER', 'Limite quotidienne atteinte pour ton compte', 429, cors);
      if (!(await bump(env, 'g:' + day, Number(env.GLOBAL_LIMIT || 400)))) return err('QUOTA_CLUB', 'Limite quotidienne du club atteinte', 429, cors);
      const t1 = Date.now();
      let r, schema;
      try { ({ r, schema } = await callGemini(env, img, sheets, fetchFn)); }
      catch (e) { console.log('BPT gemini réseau', String(e && e.message).slice(0, 200)); return err('GEMINI_NETWORK', 'Connexion à Gemini impossible : ' + String(e && e.message).slice(0, 120), 502, cors); }
      const geminiMs = Date.now() - t1;
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = String((j.error && j.error.message) || ('Erreur Gemini ' + r.status)).slice(0, 200);
        console.log('BPT gemini erreur', r.status, msg);
        return err('GEMINI_UPSTREAM', 'Gemini ' + r.status + ' : ' + msg, r.status === 429 ? 429 : 502, cors, r.status);
      }
      const c = (j.candidates || [])[0];
      const text = c && c.content && c.content.parts ? c.content.parts.map(p => p.text || '').join('') : '';
      let o; try { o = JSON.parse(text); } catch (_) { const m = String(text).match(/\{[\s\S]*\}/); try { o = m && JSON.parse(m[0]); } catch (__) { o = null; } }
      if (!o) {
        const why = (c && c.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || 'réponse vide';
        console.log('BPT réponse illisible', why, String(text).slice(0, 200));
        return err('GEMINI_UNREADABLE', 'Réponse IA illisible (' + why + ')', 502, cors);
      }
      const list = Array.isArray(o.jetons) ? o.jetons : null;
      if (!list || list.length > 150) return err('GEMINI_VALUE', 'Réponse IA incohérente (liste de jetons)', 502, cors);
      const counts = {}; KEYS.forEach(k => counts[k] = 0);
      const jetons = [];
      for (const it of list) {
        if (!it || !KEYS.includes(it.c)) continue;
        counts[it.c]++;
        const cl = v => Math.max(0, Math.min(1000, Math.round(Number(v) || 0)));
        jetons.push({ c: it.c, x: cl(it.x), y: cl(it.y) });
      }
      return json({ counts, jetons, certitude: ['haute', 'moyenne', 'basse'].includes(o.certitude) ? o.certitude : 'moyenne', jeuDetecte: ['moonriver', 'palace', 'indetermine'].includes(o.jeuDetecte) ? o.jeuDetecte : 'indetermine', timing: { geminiMs, totalMs: Date.now() - t0, think: thinkingChoice, schema, sheets: sheets.length } }, 200, cors);
    } catch (e) {
      console.log('BPT exception', String(e && e.stack || e).slice(0, 400));
      return err('WORKER_EXCEPTION', 'Exception Worker : ' + String(e && e.message || e).slice(0, 160), 500, cors);
    }
  }
};
