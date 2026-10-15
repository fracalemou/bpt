BPT V9.0.34

Correctif login :
- source unique joueurs : bpt/state/main/data/players
- codes de connexion : 4 chiffres uniquement
- suppression des appels résiduels à reconcileLoginRegistry() qui provoquaient l’erreur d’identification
- même logique de données sur PC et téléphone ; seule la présentation diffère
- distinction fonctionnelle uniquement dans le Live selon le rôle organisateur / spectateur

- V9.0.28 : archives 2020-2021 (46 parties) et 2022-2023 (26 parties) injectées ; 2021-2022 exclue ; 2023-2024 et 2025-2026 préservées.

- V9.0.28 : normalisation globale des identités historiques validées et recalcul transversal des cumuls/statistiques.

- V9.0.28 : le mode « Cumul toutes saisons » n’est plus terminal ; retour direct vers les saisons via précédent/suivant, et conservation générique des archives lors des synchronisations Firebase.

- V9.0.28 : affichage du nombre d’éliminations pour le bourreau principal et du nombre de kills sur la victime principale dans le classement.

- V9.0.28 : purge exacte des sessions de paris orphelines via gameNo ; suppression de la trace d'une partie supprimée (notamment l'ancienne partie 6) et recalcul du ledger joueurs.

- V9.0.30 : diagnostic automatique de cohérence (parties, doublons, places, règles de tablier, sessions de paris orphelines).
- V9.0.30 : nouvel écran Historique des saisons avec accès direct au classement de chaque archive.
- V9.0.30 : cumul carrière enrichi avec taux de victoire, taux de podium, ratio kills/partie et synthèse carrière.

- V9.0.33 : libellé dynamique des records : « Records de la saison XXXX-XXXX » ou « Records toutes saisons » selon le contexte affiché.

- V9.0.33 : ajout d’une tuile « Cumul toutes saisons » dans l’écran Saisons, au même format que les tuiles de saison, avec accès direct au classement cumulé.

- V9.0.34 : écran Saisons trié de la saison la plus récente à la plus ancienne ; tuile « Cumul toutes saisons » placée en dernier.

V9.0.37
- Records & accomplissements : sélecteur autonome Saison actuelle / Saison précédente / Cumul toutes saisons.
- Saisons précédentes : la saison en cours n'est plus affichée dans les archives ; cumul conservé en dernier.
- Classements : un clic sur l'onglet revient toujours à la saison 2026-2027.

V9.0.37 — Correctif affichage Live mobile : actions avant-partie et révélation bounty toujours visibles.


V9.0.37 : Classements regroupe saison en cours, archives et cumul. L'onglet Saisons précédentes est retiré.
