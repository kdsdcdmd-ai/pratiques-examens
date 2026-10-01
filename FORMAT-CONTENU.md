# Ajouter une pratique sans toucher au MASTER

Un seul fichier `contenus/<examId>.json` contient le contenu d’un examen. `bibliotheque.json` est le petit index de navigation. Le moteur, les styles et les pages communes restent fixes.

Le format reprend le modèle existant :
- `configuration` : `schemaVersion:1`, `examId` unique, `enfant`, `subject`, `title`, `chapitre`, `schoolLevel`, `locale:"fr-CA"`, `contentVersion`, `storageVersion`, `themes`, `labels`, `miniQuizSize`, `finalQuestionIds`, `reviewQuestionIds`, `reviewBatchSize`, `variantPolicy`, `historyLimit`, `historyDisplayLimit`, `quizPaths`, `defaultQuizPath`. Copier la structure d’une pratique existante, sans ses identifiants ni son `legacyImport`. Nouvelle politique `mode:"fixed"`.
- `documents` : identifiant et titre des sources, pages reçues; jamais les fichiers originaux ni leurs chemins privés.
- `inventory` et `objectives` : identifiants stables, titres, `sourceRefs`, `lessonIds`, `questionIds`; inventaire `status:"reviewed"` seulement après lecture réelle.
- `lessons` : `id`, `title`, `theme`, `sourceRefs`, `core`, `example`, `more`; au besoin `parts:[{title,body,resourceId}]`, `afterCoreResource`, `afterExampleResource`.
- `questions` : `id`, `lessonId`, `objectiveIds`, `inventoryIds`, `sourceRefs`, `t`, `q`, `writtenPrompt`, `o` (choix), `a` (index correct), `accepted`, `e` (explication), `hint`, `tutorial`, `grading`, `feedbackResource`. Les choix incorrects doivent être réellement faux, plausibles et assez proches pour vérifier la compréhension. Plusieurs réponses intentionnelles utilisent le `type:"multi-select"` existant. Conserver les associations existantes si utiles.
- `responseType:"choice"` pour les choix; `"number"` pour un calcul avec `numericAnswer:{value,units}` et `grading:{type:"aliases",numeric:true}`; `"development"` pour une réponse expliquée avec `rubric` (points attendus). Les développements sont autoévalués, hors score automatique.
- `assets` : dictionnaire identifiant → HTML/SVG statique autonome pour les illustrations et corrections. Les images utiles peuvent être intégrées en données, sans lien vers une photo source. Aucun script, événement HTML ou ressource externe. `promptResource` et `requiresVisual:true` pour les questions dépendant d’un visuel.
- `variants:{}`, `activities:[]` sauf contenu explicitement préparé pour les composants existants.
- `validationSource:{verified:true,date:"AAAA-MM-JJ",note:"Pages effectivement vérifiées, couverture et calculs contrôlés."}` : attestation après validation réelle, pas une case à remplir automatiquement.

Chaque `sourceRefs` contient `{documentId,pages}` ou `{documentId,section}`. Chaque objectif apparaît dans chaque parcours. `reviewQuestionIds` couvre la banque complète. Les formules à prononcer peuvent être déclarées dans `configuration.speechReplacements`; aucune connaissance scolaire n’entre dans le moteur.

Pour les pratiques de sciences, d’histoire et de géographie, les parcours Simple, Intermédiaire et Complet utilisent des questions distinctes dès que la matière le permet. Varier l’élément, la molécule, les données, le document ou l’exemple; ne pas seulement reformuler la même question. Toutes les questions doivent être autonomes : inclure dans l’énoncé les données et contraintes nécessaires, ou joindre le visuel utile avec `promptResource`. Ne jamais demander à l’enfant d’avoir son cahier sous les yeux. Si la pratique demandée doit être entièrement à choix, convertir aussi les calculs et les développements en choix avec des démarches ou résultats plausibles.

Commande : `node outils/ajouter-examen.mjs nouveau-contenu.json`. Publier ensuite le nouveau contenu et l’index sur GitHub Pages. Les anciens examens ne sont jamais remplacés. Aucun build du MASTER.
