# Activhome Cover Panel

**Activhome Cover Panel** est une carte Lovelace personnalisée pour Home Assistant, dédiée au contrôle des **volets, stores et stores bannes** (`cover`).  
Elle propose une interface **claire, robuste et tactile**, pensée pour un usage quotidien sur tablettes murales et dashboards fixes.

Cette carte fait partie de la gamme Activhome et applique les mêmes principes : lisibilité, cohérence visuelle, stabilité et respect des conventions Home Assistant.

---

## 1. À quoi sert cette carte ?

Activhome Cover Panel permet de piloter **un volet ou store** sur une seule ligne compacte comprenant :

- une icône SVG dynamique représentant l’état du store
- un nom cliquable
- trois actions explicites : **ouvrir**, **stop**, **fermer**

La carte est conçue pour remplacer avantageusement les cartes génériques lorsque la priorité est :
- la compréhension immédiate des actions,
- la précision tactile,
- l’intégration visuelle dans une interface professionnelle.

---

## 2. Dans quels cas l’utiliser ?

Cette carte est particulièrement adaptée aux contextes suivants :

- Tablette murale Home Assistant
- Dashboard client ou résidentiel
- Interfaces tactiles sans souris
- Contrôle fréquent de volets/stores
- Projets nécessitant des icônes personnalisées cohérentes

👉 Elle est pensée pour un **usage réel**, pas pour une démonstration ponctuelle.

---

## 3. Ce que fait la carte

Fonctionnalités principales :

- Affichage sur **une seule ligne (50px)**
- Icône SVG dynamique basée sur `cover.current_position`
- Support des variantes :
  - `store` (par défaut)
  - `store_banne`
- Nom cliquable :
  - navigation vers une vue si configurée
  - sinon ouverture du *more-info*
- Actions dédiées :
  - `open_cover`
  - `stop_cover`
  - `close_cover`
- Styles visuels intégrés
- Application optionnelle d’un thème Home Assistant **au niveau de la carte uniquement**
- Éditeur UI natif (aucun YAML obligatoire)
- Comportement tactile iOS optimisé

---

## 4. Ce que la carte ne fait volontairement pas

Par conception, Activhome Cover Panel :

- ne modifie pas la logique Home Assistant des services `cover`
- ne gère pas les pourcentages manuellement
- ne remplace pas le *more-info*
- ne dépend d’aucune librairie externe
- ne nécessite aucun build ou compilation

👉 Toute inversion liée au mode **store_banne** est **strictement visuelle**.

---

## 5. Prérequis techniques

- Home Assistant avec interface Lovelace
- Une entité du domaine `cover`
- Accès au dossier `/config/www/`

---

## 6. Ressources graphiques requises (icônes)

Cette carte **nécessite des icônes SVG personnalisées Activhome** pour fonctionner correctement.

### Arborescence attendue

Créer l’arborescence suivante dans le dossier `www` :

```
/config/www/
└── icons/
    └── stores/
        ├── store_0.svg
        ├── store_10.svg
        ├── store_20.svg
        ├── ...
        ├── store_100.svg
        └── storebanne-unique.svg
```

### Détail des fichiers requis

- **11 fichiers** pour les stores classiques :  
  `store_0.svg` → `store_100.svg` (par pas de 10)
- **1 fichier spécifique** pour les stores bannes :  
  `storebanne-unique.svg`

👉 Ces fichiers sont utilisés uniquement pour l’affichage visuel.  
👉 La logique Home Assistant reste inchangée.

---

## 7. Installation (manuelle)

### Étape 1 — Télécharger le fichier

Télécharger le fichier suivant depuis la dernière version :

```
activhome-cover-panel.js
```

### Étape 2 — Copier le fichier

Créer le dossier suivant si nécessaire :

```
/config/www/activhome-cover-panel/
```

Puis y placer le fichier :

```
/config/www/activhome-cover-panel/activhome-cover-panel.js
```

### Étape 3 — Déclarer la ressource

Dans Home Assistant :

- **Paramètres → Tableaux de bord → Ressources**
- Ajouter une ressource :
  - Type : *JavaScript module*
  - URL :

```
/local/activhome-cover-panel/activhome-cover-panel.js
```

Redémarrer ou rafraîchir le navigateur.

---

## 8. Utilisation de base

Configuration minimale :

```yaml
type: custom:activhome-cover-panel
entity: cover.salon
```

---

## 9. Options de configuration

### Options principales

| Option | Description |
|------|------------|
| `entity` | Entité cover (obligatoire) |
| `name` | Nom affiché personnalisé |
| `navigation_path` | Navigation au clic sur le nom |
| `tap_action` | Action UI native (navigate) |
| `theme` | Thème Home Assistant appliqué à la carte |
| `style` | Style visuel de la carte |
| `font_size` | Taille du texte (16px à 24px) |
| `card_style` | CSS avancé injecté dans la carte |
| `cover_variant` | `store` (défaut) ou `store_banne` |

---

## 10. Variantes de store

### `store` (par défaut)
- Mapping visuel standard
- Icône dynamique basée sur `current_position`

### `store_banne`
- Mapping **visuel inversé uniquement**
- Utilise l’icône `storebanne-unique.svg`
- Même logique Home Assistant
- Même services appelés

👉 Aucun impact fonctionnel sur Home Assistant.

---

## 11. Styles visuels disponibles

Styles intégrés :

- transparent  
- transparent_vertical_stack  
- activhome  
- glass  
- dark_glass  
- solid  
- neon_pulse  
- neon_glow  
- primary_breathe  
- primary_tint  

---

## 12. Bonnes pratiques

- Vérifier la présence des icônes avant utilisation
- Utiliser `store_banne` uniquement pour des stores bannes réels
- Laisser le nom court pour préserver la lisibilité
- Réserver `card_style` aux ajustements visuels fins

---

## 13. Notes importantes

- Hauteur fixe : **50px**
- Taille de police par défaut : **20px**
- Les styles et thèmes s’appliquent uniquement à la carte
- Comportement tactile iOS optimisé (pas d’effet stroboscopique)

---

## 14. Licence

MIT License  
© 2025 — Activhome / Iouri Becq
