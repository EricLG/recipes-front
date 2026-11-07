# recipes-front — consignes pour les agents

## Rôle du projet

Frontend Angular 21 en TypeScript, avec composants standalone, routing Angular, RxJS, Bootstrap/ng-bootstrap, ng-select et SCSS. L’application consomme l’API de [`recipes-back`](../recipes-back/) via le proxy de développement.

## Organisation

```text
src/app/
├── auth/        # service, interceptor et guards JWT
├── components/  # écrans et composants par fonctionnalité
├── models/      # modèles de données applicatifs
├── enums/       # enums et utilitaires associés
├── layout/      # structure visuelle commune
└── types/       # types partagés
```

- Garder les composants responsables de l’affichage et de l’orchestration UI ; placer les appels HTTP et la logique réutilisable dans des services.
- Utiliser les routes et guards existants (`authGuard`, `loggedInGuard`) pour contrôler l’accès ; ne pas contourner l’interceptor d’authentification.
- Respecter les conventions existantes : fichiers séparés `.ts`, `.html`, `.scss`, indentation et formatage Prettier déjà configurés, styles globaux dans `src/styles.scss`.
- Réutiliser les enums et modèles existants au lieu de dupliquer des chaînes métier. Lorsqu’un contrat backend change, mettre à jour les types/services et les vues concernées ensemble.
- Préserver l’accessibilité, les messages d’erreur visibles et les états de chargement/sauvegarde dans les écrans asynchrones.

## Contrats et fonctionnalités métier

- Lire [`docs/uml/recipe-domain.md`](./docs/uml/recipe-domain.md) et [`docs/uml/food-domain.md`](./docs/uml/food-domain.md) avant de modifier les modèles de recette ou d’aliment.
- Lire [`docs/shopping-lists-frontend.md`](./docs/shopping-lists-frontend.md) avant toute modification de la liste de courses. Le contrat actuel charge une semaine, conserve les changements en mémoire et envoie un `PUT` complet uniquement lors de **Sauvegarder**.
- Les appels utilisent `/api`, `weekStart` est le lundi au format `YYYY-MM-DD`, et les listes existantes sont identifiées par la réponse API, pas par une reconstruction locale silencieuse.
- La prochaine évolution documentée de la liste de courses doit être conçue de bout en bout : navigation par semaine comme le planning, création vide sans recette, import explicite des recettes lorsqu’elles sont disponibles et ajout d’articles libres. Préserver les articles manuels lors de l’import et éviter toute sauvegarde automatique non spécifiée.
- Pour les ingrédients générés depuis le planning, conserver des clés stables (`foodId` + unité/mesure) afin de ne pas casser les coches, stocks et affectations lors du rafraîchissement.

## Environnements et commandes

Les configurations sont dans `src/environments/` et le proxy dans [`proxy.conf.json`](./proxy.conf.json). Ne pas mettre de secrets dans le frontend : les valeurs d’environnement sont publiques une fois compilées.

Depuis `recipes-front/` :

```bash
npm install
npm start
npm run build
npm run lint
npm test
```

Pour une modification de composant ou de service, adapter les tests Vitest correspondants et exécuter au minimum `npm run lint`, `npm test` et `npm run build`.
