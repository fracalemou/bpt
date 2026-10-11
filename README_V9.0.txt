BPT V9.0 — nettoyage du code

Structure
- index.html : structure de la page et ordre des dépendances
- css/app.css : styles
- js/core : socle applicatif, version, Firebase et navigation
- js/modules/live : Live et interface du Live
- js/modules/betting : paris et cotes
- js/features : identité, présence, PWA, photos et résumé de partie
- service-worker.js : cache V9.0
- assets, icônes et manifest : ressources de l’application

Les scripts de suppression automatique des anciennes données ont été retirés sans être
exécutés. Cette livraison ne modifie aucune donnée locale ni Firebase.

Le document HTML, les styles et les scripts sont séparés, mais le cœur applicatif reste
encore largement regroupé dans js/core/application.js : cette copie n’est pas une
architecture complète en modules indépendants.

Déploiement
Déployer le contenu du dossier bpt/ comme racine du site, en conservant l’arborescence.
