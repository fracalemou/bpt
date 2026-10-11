BPT V9.0.17

Correctif login :
- source unique joueurs : bpt/state/main/data/players
- codes de connexion : 4 chiffres uniquement
- suppression des appels résiduels à reconcileLoginRegistry() qui provoquaient l’erreur d’identification
- même logique de données sur PC et téléphone ; seule la présentation diffère
- distinction fonctionnelle uniquement dans le Live selon le rôle organisateur / spectateur
