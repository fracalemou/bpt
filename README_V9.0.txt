BPT V9.0.7 — REGISTRE DE CONNEXION UNIQUE

Règle d'architecture :
- PC et téléphone = même application, même Firebase, mêmes données et mêmes règles.
- La seule différence entre PC et téléphone est l'affichage responsive.
- Dans le Live, les droits diffèrent uniquement selon le rôle organisateur/spectateur.

Connexion :
- Une seule table Firebase de référence : bpt/login_registry_v1
- Chaque entrée contient : nom, actif/inactif et code personnel chiffré.
- Le login PC et téléphone lit exactement ce même registre.
- Aucun fallback local pour la liste de connexion.
- L'ancienne table bpt_profile_codes_v1 est migrée puis supprimée automatiquement.

Déploiement GitHub Pages :
- Tous les fichiers du ZIP sont à la racine.
- Dézipper, sélectionner tout, Add file > Upload files, Commit sur main.
