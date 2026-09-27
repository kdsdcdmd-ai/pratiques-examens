# MASTER verrouillé

Ne modifier aucun fichier de `MASTER/`, `bibliotheque.js` ou `index.html` sans la demande explicite « Modifier le MASTER ». Ne pas régénérer ni analyser le MASTER pour ajouter un examen. Utiliser uniquement le format de contenu existant et les commandes ci-dessous.

## Prochain examen

1. Lire les pages fournies, retranscrire et vérifier chaque notion, définition, formule, méthode et exemple pertinent. Conserver les originaux hors du dépôt.
2. Produire un JSON autonome selon `FORMAT-CONTENU.md`, avec un nouvel `configuration.examId`, enfant, matière, titre et chapitre. Chaque notion relie sources → leçons → questions → réponses → explications. Refaire les calculs; contrôler les distracteurs. Ne jamais deviner un passage illisible : demander sa clarification avant publication.
3. Renseigner `validationSource` uniquement après la vérification réelle. Exécuter `node outils/ajouter-examen.mjs chemin/nouveau-contenu.json`. Cette commande ajoute seulement `contenus/<examId>.json` et l’index `bibliotheque.json`, refuse tout remplacement et ne lit pas le MASTER.
4. Publier ces deux fichiers dans la branche de publication du dépôt, puis vérifier GitHub Pages. Ne toucher à aucun autre fichier. Ne supprimer aucune ancienne pratique.

Les contrôles automatiques vérifient la structure; ils ne prouvent pas la fidélité aux sources. Toute nouvelle pratique requiert une relecture humaine des liens et des réponses. Les réserves des examens historiques migrés restent documentées; ne jamais les présenter comme une validation exhaustive.

Pas d’IA pendant l’étude. Aucun ajout d’API, base de données, profil, panneau administrateur ou autre fonction sans demande. Progression locale et export existants conservés. Ne jamais publier les sauvegardes des enfants, documents complets ou chemins privés.
