# Pratiques d’examen — Cédric et Mirka

Bibliothèque : https://kdsdcdmd-ai.github.io/pratiques-examens/

- `MASTER/` : modèle commun existant, verrouillé. Demande explicite « Modifier le MASTER » requise pour le changer.
- `contenus/` : un JSON autonome par examen, conservé définitivement.
- `bibliotheque.json` : petit index Accueil → Enfant → Matière → Pratiques.
- `FORMAT-CONTENU.md` : seul guide nécessaire pour ajouter une pratique.

Prochain examen : lire les nouvelles pages, extraire et vérifier la matière, préparer le JSON, vérifier questions/réponses/calculs/explications, exécuter `node outils/ajouter-examen.mjs nouveau-contenu.json`, puis publier uniquement ce nouveau fichier et l’index dans `main`. Aucun build ni modification du MASTER. Ne pas publier les fichiers originaux.

GitHub Pages : branche `main`, dossier `/`. Site statique, sans IA, sans abonnement d’hébergement. Aucune clé API. Les lectures vocales utilisent l’appareil/navigateur.

La progression reste propre à chaque navigateur et examen. Les fonctions existantes d’export/import permettent de transférer les résultats entre appareils; aucune synchronisation automatique. Les résultats des anciens fichiers locaux peuvent être exportés puis importés sur le site.

Vérification technique : `node tests/systeme.cjs` et `node tests/mirka.cjs`. Ces tests ne remplacent pas la validation pédagogique des sources.
