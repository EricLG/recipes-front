# Parcours frontend — planning et listes de courses

## Navigation

Chaque compte possède ses plannings, cuissons, courses et préférences. Les pages
utilisent `?week=YYYY-MM-DD` (lundi), conservé dans leurs liens croisés.
Boutons précédent, suivant et **Semaine en cours** ; au plus la semaine suivante.
Calendrier `Europe/Paris`. Semaines passées en lecture seule, également côté API.

## Planning

Objectif entier positif, 24 par défaut. Si le planning est absent (404), afficher
**Créer le planning**, sans **Voir les courses** ni **Compléter automatiquement**.
La création reste manuelle. Ensuite, enregistrer automatiquement un objectif
valide après 400 ms sans saisie ; aucun bouton **Enregistrer l'objectif**.
Afficher l'enregistrement en cours, bloquer les opérations concurrentes et permettre
de réessayer en cas d'échec sans perdre la valeur saisie. Aucun jour de préparation,
ajustement de portions ou doublon.
Chaque action est enregistrée immédiatement. Afficher total, objectif, manque et
surplus. Le pictogramme `assets/pictos/vege.png` apparaît à côté des parts de chaque recette strictement
végétarienne, selon son statut actuel chargé depuis ses détails. Aucun pictogramme
pour les recettes flexibles ou introuvables.
Noms et rendements sont des snapshots.
La confirmation « Planning enregistré. » apparaît dans un toast ng-bootstrap
pendant 4 secondes. Les erreurs et le manque de parts après complétion restent visibles.

**Compléter automatiquement** conserve les choix et tire sans remise jusqu'à
atteindre/dépasser l'objectif. Critères stricts : approuvée, catégorie MAIN ou OTHERS,
saison météorologique du lundi ciblé, absente de S et non cuisinée dans S−1/S−2.
Si les candidats manquent, conserver le résultat partiel et annoncer le manque.
Aucun élargissement des critères ni optimisation du surplus.
La complétion vise 50 % de recettes végétariennes en nombre de recettes ;
les recettes non végétariennes et flexibles forment l'autre moitié.
Compter tous les choix existants selon leur statut actuel, y compris manuels.
Privilégier le groupe minoritaire, tirer au hasard en cas d'égalité et utiliser
l'autre groupe si le premier est épuisé. Arrêter dès l'objectif de parts atteint,
sans retirer de choix ni rechercher une combinaison optimale. Une recette supprimée
ou sans statut connu reste dans le planning mais ne compte pas dans la proportion.
Le remplacement ne contraint pas cette proportion.
 Remplacement via
ng-select recherchable avec les mêmes candidats, même pour un rendement inférieur.

Les actions sur carte/détail ajoutent toute recette approuvée à la semaine
courante, hors contraintes de saison/catégorie/historique. Un doublon est signalé.
Le bouton compact de carte est hors du lien, avec icône, titre et nom accessible.
Un sélecteur recherchable sous la liste du planning permet aussi l'ajout immédiat
d'une recette approuvée à la semaine affichée, sans confirmation supplémentaire.
Les recettes déjà présentes sont exclues. Comme sur les cartes, cet ajout manuel
n'impose pas les filtres de saison, catégorie ou cuisson récente du remplacement.
Cuisson modifiable seulement en semaine courante ; décocher avant retrait/remplacement.

## Courses

Deux vues partagent la même liste locale, sans rechargement au changement de mode :

- **À la maison** (vue initiale) : import, ajout d'articles libres, stock et
  affectation aux magasins, avec les deux boutons par article.
- **En magasin** : un magasin visité sélectionné en haut de page ; seuls ses
  articles hors stock apparaissent, regroupés par catégorie. Aucun import,
  ajout/édition, changement d'affectation ou passage en stock dans cette vue.
  Une ligne entière sert de cible de cochage, avec 44 px de hauteur minimum et
  une case de 24 px. Les lignes cochées restent en place et barrées, sans tri ni
  disparition au toucher. Les articles libres suivent le même fonctionnement.

Le compteur porte uniquement sur le magasin visité. Le changement de magasin
conserve les coches et les modifications locales. Le retour à la préparation
retrouve les affectations et stocks inchangés. Une barre en bas d'écran reste
visible au défilement avec le magasin, la progression et les erreurs de sauvegarde. La sauvegarde est automatique ; le contrat HTTP reste inchangé.
Les listes historiques restent en lecture seule dans les deux vues.

Un GET existant est affiché tel quel. Un 404 prépare un état local vide avec les
préférences des deux magasins ; aucun planning ni PUT implicite. Une erreur de
chargement bloque l'édition pour éviter d'écraser un snapshot non chargé.

**Importer / Actualiser les ingrédients du planning** charge toutes les recettes,
cuisinées ou non, et leurs sous-recettes. La quantité d'une sous-recette représente
des parts : facteur parent × quantité / rendement enfant. Chaque ingrédient
conserve la mesure de la recette, sans conversion en grammes ni en kilogrammes
à l'affichage. Regrouper uniquement un même aliment et une même mesure
(`foodId:measureId`) ; deux mesures différentes donnent deux lignes indépendantes,
même si elles sont convertibles. Le libellé `unité` est omis à l'affichage : « 2 Œufs ».

Un import remplace les besoins sans cumul, préserve les articles libres et les
états/magasins de même clé. Si la quantité change, réinitialiser la coche d'achat,
conserver stock/magasin et signaler la ligne. Retirer les ingrédients inutiles et
afficher le bilan dans un toast ng-bootstrap pendant 4 secondes.
Un chargement de recette échoué laisse la liste intacte.

### Ajout d'ingrédients et quantités

En vue **À la maison**, un sélecteur recherchable permet de choisir un aliment
existant absent de toute la liste (y compris les ingrédients cochés ou en stock),
puis une de ses mesures et une quantité finie strictement positive. La mesure par
défaut est présélectionnée. L'article conserve la clé `foodId:measureId`, son nom,
sa catégorie et le libellé de la mesure ; il est classé dans sa catégorie, affecté
au premier magasin, non coché et hors stock. Aucun aliment ou mesure n'est créé.
Un aliment sans mesure ne peut pas être ajouté. Un ingrédient ajouté manuellement
peut être supprimé depuis cette vue.

Chaque ingrédient à acheter ou en stock dispose d'un champ quantité, dans sa
mesure actuelle. Un changement valide conserve clé, mesure, catégorie, magasin et
stock, mais réinitialise la coche d'achat. Une valeur vide, nulle, négative ou non
finie est refusée et la quantité précédente est rétablie. Aucune édition en vue
**En magasin**, pendant une opération ou sur une semaine passée.

Le snapshot s'étend d'un champ optionnel réservé aux ingrédients :
`source: 'plan' | 'manual'`. Sans ce champ, un ingrédient est issu du planning,
comme avant. Un ajout manuel porte `source: 'manual'`. Ce champ est transmis par
PUT et renvoyé par GET. Les articles libres ne l'utilisent pas.

Les imports conservent les ajouts manuels mais reprennent les quantités du planning
pour toutes les clés importées, même après une modification manuelle. Si un besoin
du planning partage la clé d'un ajout manuel, une seule ligne est conservée avec
la quantité importée et la provenance manuelle, sans cumul. Un ingrédient du planning
disparaît quand il n'est plus nécessaire au planning. Des mesures
différentes restent des lignes indépendantes. Les ajouts, suppressions manuelles
et éditions de quantité utilisent le délai de sauvegarde déjà existant (3 secondes),
le même PUT complet et les mêmes protections contre la perte de modifications.

Exactement deux magasins renommables, sans ajout/suppression. Nouveaux articles
affectés au premier. Les noms sauvegardés servent de préférences aux nouvelles
listes ; les anciennes conservent leur snapshot. Les états stock/achat sont
exclusifs. Le groupe **Autres articles** accepte un simple texte modifiable et
supprimable, sans aliment ni quantité structurée.
L'affectation à un magasin se fait en un clic via deux boutons, avec le magasin
actif mis en évidence et annoncé par `aria-pressed`, y compris pour les articles en stock.

Sauvegarde automatique immédiatement après un import réussi et après 3 secondes
sans modification pour les magasins, stocks, coches et articles libres (ajout,
édition, suppression). Aucun bouton de sauvegarde. PUT complet sans version.
La confirmation de sauvegarde utilise un toast ng-bootstrap commun aux deux vues,
qui disparaît automatiquement après 4 secondes. Les erreurs restent visibles.
Aucun message d'attente ou de sauvegarde en cours pour éviter les décalages de contenu.
Le GET et le 404 ne déclenchent aucune écriture.
Signaler les changements et confirmer avant changement de semaine/sortie ;
protéger aussi la fermeture et le rechargement du navigateur.
Une sauvegarde échouée conserve le travail local et affiche une erreur ; nouvelle
tentative automatique après 10 secondes. Une modification relance le délai de
3 secondes. Annuler les sauvegardes différées au changement de semaine et
à la destruction du composant. Bloquer les éditions et
navigations concurrentes pendant chargement/import/sauvegarde.

Contrats détaillés : backend `docs/api/shopping-lists.md` et
`docs/api/weekly-recipe-plans.md`. Les anciennes règles de trois magasins et
d'import automatique au chargement sont remplacées par ce document.
