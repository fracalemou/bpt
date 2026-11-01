# BPT 10.4.137 — Analyse IA, erreur HTTP 502

## Ce que le correctif réalise

- Affiche explicitement les HTTP 502/503/504 même si le Worker renvoie une page HTML.
- Ne masque plus un HTTP 502 sous « JSON invalide ».
- Propose « Réessayer cette photo » seulement après un échec, à l'initiative du joueur.
- Ne relance jamais Gemini automatiquement : une analyse correspond à une demande.
- Ne valide jamais un stack si l'IA échoue. Le comptage manuel reste disponible.
- Journalise le code HTTP, le code d'erreur serveur, la durée et éventuellement le CF-Ray, sans photo ni clés.

**Attention : cela ne répare pas une panne Cloudflare Worker ou Gemini.** Le code du Worker ne figure pas dans ce dépôt ; il reste à contrôler sur Cloudflare.

## Diagnostic Cloudflare Worker

1. Ouvrir https://dash.cloudflare.com/ → Workers & Pages → `bpt-scanner-ia` → Observability → Logs (ou Tail/Live Logs selon l'interface).
2. Relancer une photo de test depuis BPT et relever l'heure exacte, le code HTTP et, s'il est affiché, le CF-Ray.
3. Chercher : erreur de `fetch` vers Gemini, délai dépassé, HTTP 429/500/503, exception JavaScript, mauvaise configuration du modèle, ou réponse JSON invalide.
4. Vérifier que le Worker transforme explicitement les erreurs du fournisseur en réponses JSON avec un statut cohérent, et ne remplace pas tous les échecs par 502.
5. Si Gemini renvoie 429, le Worker doit conserver le statut 429 : c'est un quota, pas une panne 502.
6. Conserver la clé Gemini en secret Cloudflare et la vérification d'identité Firebase. Ne pas journaliser les photos ni l'en-tête Authorization.

Exemple de gestion à adapter au Worker existant (ne pas remplacer aveuglément le serveur) :

```js
let upstream;
try {
  upstream = await fetch(geminiUrl, geminiOptions);
} catch (err) {
  console.error('Gemini network failure', String(err && err.name || 'error'));
  return Response.json({error:{code:'GEMINI_NETWORK',message:'Service IA momentanément indisponible'}},
    {status:502,headers:corsHeaders});
}
if (!upstream.ok) {
  console.error('Gemini upstream status', upstream.status);
  const http = upstream.status === 429 ? 429 : upstream.status >= 500 ? 502 : 400;
  return Response.json({error:{code:'GEMINI_UPSTREAM',upstreamStatus:upstream.status,
    message:'Analyse temporairement indisponible'}},{status:http,headers:corsHeaders});
}
```

Respecter les en-têtes CORS de l'application existante. Vérifier le modèle utilisé et ne pas injecter de clé API dans `bpt-ai-config.js` sur GitHub Pages.
