# Optimiser l'analyse Gemini sur le Cloudflare Worker BPT

**Ce fichier est une procédure pour l'administrateur du Worker, pas un changement déployé sur le serveur.** La version GitHub Pages ne peut pas changer la durée d'inférence de Gemini.

## Diagnostic de durée

La nouvelle interface BPT affiche : `Durée : XX s (préparation : X s ; serveur : Y s)`.
Si la durée du serveur domine, l'optimisation du navigateur ne peut guère accélérer l'analyse.
Le Worker peut mesurer `Date.now()` avant/après l'appel à Gemini et consigner seulement les durées, les tailles et les codes HTTP, jamais les images, clés ou tokens.

## Pistes de correction côté Worker

1. Envoyer **un unique appel Gemini** par photo, sans relance automatique cachée.
2. Utiliser une référence de modèle rapide et stable, et tester les performances sur 10 photos de référence avant changement. `gemini-2.5-flash` avec `thinkingConfig:{thinkingBudget:0}` peut réduire la latence, au prix possible d'une précision inférieure. Avec `gemini-2.5-flash-lite`, la réflexion est normalement désactivée par défaut. Vérifier la compatibilité du modèle réel.
3. Imposer `generationConfig.responseMimeType='application/json'` et un `responseSchema` adapté **aux sept couleurs actuelles** : green, blue, black, purple, yellow, pink, orange. Éviter les listes de jetons et les paragraphes.
4. Définir un `maxOutputTokens` raisonnable (par exemple 256) si la réponse se limite à 7 entiers et un indice de fiabilité. Tester pour s'assurer qu'aucune réponse n'est tronquée.
5. Réduire le prompt à la consigne de comptage et au référentiel du club. Retirer les longues descriptions, les explications étape par étape et les analyses détaillées.
6. Répondre au navigateur avec `{counts:{green:0,blue:0,black:0,purple:0,yellow:0,pink:0,orange:0},certitude:"moyenne"}` (les valeurs sont illustratives) ; vérifier tous les types, ne jamais inventer un compte.
7. Tester 10 photos répétées pour mesurer temps médian, temps maximum et précision, car l’optimisation de la vitesse peut réduire la qualité du comptage.

## Attention

- La clé Gemini doit rester une variable secrète du Worker.
- Conserver l'authentification Firebase, les règles CORS et la limite de requêtes.
- Ne pas activer de facturation payante si le club veut rester gratuit.
- L'ancien fichier `CORRECTION_CLOUDFLARE_WORKER_JSON.md` mentionnait six couleurs et les anciennes appellations : il ne doit plus servir de référence sans adaptation.

Références officielles : https://ai.google.dev/api/generate-content et https://firebase.google.com/docs/ai-logic/thinking?hl=fr
