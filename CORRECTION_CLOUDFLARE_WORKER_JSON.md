# Correction durable du JSON de Gemini dans le Worker du club

Le Worker `https://bpt-scanner-ia.fracalemou.workers.dev` n'est **pas**
contenu dans le dépôt GitHub Pages. Il faut modifier son propre code,
sans toucher aux vérifications du Firebase ID token existantes.

## Dans l'appel Gemini `generateContent`

Ajoutez à la configuration de génération (en conservant vos `contents` et
la clé serveur) :

```js
const STACK_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    counts: {
      type: 'OBJECT',
      properties: {
        green: { type: 'INTEGER' },
        blue: { type: 'INTEGER' },
        black: { type: 'INTEGER' },
        purple: { type: 'INTEGER' },
        brown: { type: 'INTEGER' },
        red: { type: 'INTEGER' },
      },
      required: ['green','blue','black','purple','brown','red'],
    },
    certitude: {type: 'STRING'},
    remarque: {type: 'STRING'},
  },
  required: ['counts'],
};
const generationConfig = {
  responseMimeType: 'application/json',
  responseSchema: STACK_RESPONSE_SCHEMA,
  temperature: 0,
};
```

Ce paramètre concerne l'API `generateContent` historique et doit être
adapté si le Worker utilise la nouvelle API `interactions`.

Précisez dans le prompt : renvoyer uniquement les six quantités au format
`counts`, sans liste de jetons ni texte explicatif hors JSON. Le service
retourne au navigateur un objet JS validé ou `{result:{counts:{...}}}`.

Vérifiez côté Worker les six valeurs (entiers >= 0), rejetez tout JSON
tronqué et ne renvoyez jamais une estimation partielle. Gardez la clé
GEMINI_API_KEY côté serveur, ainsi que l'authentification Firebase et la
restriction CORS à votre site.

Le patch du Worker ne peut pas être déployé ici sans son code source et
l'accès Cloudflare. La version BPT 10.4.131 inclut uniquement la gestion
des erreurs et une nouvelle tentative de requête.
