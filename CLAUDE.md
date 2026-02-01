# CLAUDE.md - Quran Warsh App (React Native)

Application Coran Warsh avec React Native CLI (sans Expo).

## URLs de test

| Environnement | URL |
|---------------|-----|
| Production Web | https://quran.azimetech.com |
| Local Web | http://localhost:5006 |

## Architecture Cross-Platform

```
QuranWarshApp/
├── App.tsx          # Version MOBILE (React Native + PagerView)
├── App.web.tsx      # Version WEB (React + Swiper.js)
├── src/
│   ├── components/  # Composants partagés
│   ├── data/        # Données Quran (partagées)
│   └── types/       # Types TypeScript (partagés)
```

Le bundler sélectionne automatiquement le bon fichier:
- **Metro** (mobile) → App.tsx
- **Vite** (web) → App.web.tsx

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | React Native CLI 0.83 |
| Language | TypeScript |
| Swipe | react-native-pager-view (natif) |
| Storage | @react-native-async-storage |
| Animations | react-native-reanimated |

## Architecture des données Mushaf

Les données du Coran sont organisées par **lignes** (pas par versets) pour reproduire fidèlement l'apparence d'un vrai Mushaf :

- Chaque page contient **15 lignes** (standard Mushaf Warsh KFGQPC)
- Les mots sont distribués sur les lignes selon les métadonnées `line_start` et `line_end` de chaque verset
- Le script Python `generate_quran_app.py` génère cette structure ligne par ligne

### Structure des données

```typescript
interface Page {
  page: number;
  juz: number;
  sura: Surah;
  verses: Verse[];      // Pour référence
  lines: LineContent[]; // 15 lignes pour l'affichage
  total_words: number;
  total_lines: number;  // Généralement 15
}

interface LineContent {
  line: number;         // 1-15
  content: (Word | VerseEnd)[];
}
```

### Régénérer les données

```bash
cd /home/coder/workspace/quran-app-research
python3 generate_quran_app.py
# Puis copier vers le projet React
```

## Structure du projet

```
QuranWarshApp/
├── App.tsx                    # Composant principal
├── src/
│   ├── components/
│   │   └── QuranPage.tsx      # Page du Mushaf
│   ├── data/
│   │   └── quranData.ts       # 604 pages, 114 sourates
│   ├── types/
│   │   └── index.ts           # Types TypeScript
│   └── assets/
│       └── fonts/             # Police KFGQPC Warsh
├── android/                   # Projet Android natif
├── ios/                       # Projet iOS natif
└── package.json
```

## Workflow de développement

1. **Développer et tester sur le web** : https://quran.azimetech.com
2. **Valider avec E2E tests** : `npm run test:e2e`
3. **Tester sur simulateur mobile** : `npm run android` ou `npm run ios`

## Déploiement Web

### Architecture conteneur

| Composant | Valeur |
|-----------|--------|
| **Nom conteneur** | `quran-app` |
| **Image** | Python 3.11 slim + http.server |
| **Port interne** | 5006 |
| **Port externe** | 5006 (192.168.1.28:5006) |
| **DNS public** | https://quran.azimetech.com |
| **Réseau Docker** | `quran-app_default` (ne PAS connecter à d'autres réseaux) |

### Commandes de déploiement

```bash
# 1. Builder l'app React
cd /home/coder/workspace/quran-app-research/QuranWarshApp
npm run web:build

# 2. Copier le build vers le dossier Docker
# ATTENTION: copier le CONTENU de dist/, pas le dossier lui-même
cp -r dist/* /home/coder/workspace/quran-app-research/quran-app/docker/

# 3. Reconstruire et redéployer le conteneur
cd /home/coder/workspace/quran-app-research/quran-app
docker-compose build --no-cache && docker-compose up -d
```

### Points importants

1. **Ne PAS utiliser nginx:alpine** - Le Dockerfile utilise Python http.server
2. **Ne PAS monter de volumes** - Les fichiers sont copiés dans l'image au build
3. **Ne PAS connecter au réseau code-server** - Le conteneur a son propre réseau
4. **Toujours tester via l'URL publique** : https://quran.azimetech.com

### Vérification du déploiement

```bash
# Vérifier le conteneur
docker ps --filter "name=quran-app"

# Tester l'accès public
curl -s -o /dev/null -w "%{http_code}" https://quran.azimetech.com/
# Doit retourner: 200
```

NPM route `quran.azimetech.com` vers `192.168.1.28:5006` avec SSL Let's Encrypt et OAuth2.

## Commandes de développement

### Installation des dépendances

```bash
cd QuranWarshApp
npm install

# iOS uniquement (nécessite macOS)
cd ios && pod install && cd ..
```

### Lancer sur Android

```bash
# Démarrer Metro bundler
npm start

# Dans un autre terminal
npm run android

# Ou directement
npx react-native run-android
```

### Lancer sur iOS (macOS requis)

```bash
npx react-native run-ios
```

### Voir les logs

```bash
# Android - logs en temps réel
adb logcat | grep -E "(ReactNative|QuranWarsh)"

# Ou via React Native
npx react-native log-android

# iOS
npx react-native log-ios
```

## Build de production

### Android APK

```bash
cd android
./gradlew assembleRelease

# APK généré dans:
# android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle (Play Store)

```bash
cd android
./gradlew bundleRelease

# AAB généré dans:
# android/app/build/outputs/bundle/release/app-release.aab
```

### iOS (macOS requis)

```bash
# Ouvrir dans Xcode
open ios/QuranWarshApp.xcworkspace

# Puis: Product > Archive
```

## Configuration de la police Warsh

### 1. Télécharger la police

```bash
# Copier depuis le projet de recherche
cp ../quran-data-kfgqpc/warsh/font/warsh.10.ttf src/assets/fonts/KFGQPC-Warsh.ttf
```

### 2. Lier la police (Android)

Ajouter dans `android/app/src/main/assets/fonts/`:
```
KFGQPC-Warsh.ttf
```

### 3. Lier la police (iOS)

Ajouter dans `ios/QuranWarshApp/Info.plist`:
```xml
<key>UIAppFonts</key>
<array>
  <string>KFGQPC-Warsh.ttf</string>
</array>
```

## État actuel validé (01/02/2026)

### Layout Mushaf - VALIDÉ ✅

L'affichage respecte le format traditionnel du Mushaf Warsh KFGQPC :

| Élément | Description |
|---------|-------------|
| **15 lignes par page** | Standard Mushaf, chaque ligne a une hauteur proportionnelle |
| **Ornement sourate** | Bandeau décoratif SVG avec nom de la sourate (1 ligne dédiée) |
| **Basmala** | Ligne dédiée après l'ornement (sauf sourate 9 At-Tawba) |
| **Ordre strict** | Pour chaque sourate : ornement → basmala → TOUT le texte, puis sourate suivante |
| **Largeur complète** | Lignes en `justify-content: space-between` pour remplir la largeur |
| **Centrage intelligent** | Lignes avec ≤2 éléments sont centrées |

### Marqueurs Thoumn (ثمن) - VALIDÉ ✅

Les marqueurs de division Thoumn sont affichés avec un ornement spécial (étoile/fleur) pour distinguer les passages au Thoumn suivant.

#### Structure des divisions du Coran

| Division | Quantité | Description |
|----------|----------|-------------|
| **Juz (جزء)** | 30 | Parties principales |
| **Hizb (حزب)** | 60 | 2 par Juz |
| **Rub' (ربع)** | 240 | 4 par Hizb (quart) |
| **Thoumn (ثمن)** | ~480 | 8 par Hizb (huitième) |

#### Source des données

Les 434 marqueurs Thoumn sont extraits des données officielles **KFGQPC Warsh** :

```
Source: quran-data-kfgqpc/warsh/data/warshData_v10.json
Symbole: ۞ (apparaît au DÉBUT du verset suivant la division)
```

**Important** : Le symbole ۞ marque le début du verset APRÈS la division. Donc si ۞ apparaît au verset 2:16, le marqueur Thoumn doit être affiché sur le verset **2:15**.

#### Extraction des marqueurs

```python
# Script pour extraire les marqueurs Thoumn
import json

with open('warshData_v10.json', 'r') as f:
    data = json.load(f)

markers = []
prev_verse = None
for verse in data:
    if '۞' in verse['aya_text']:
        if prev_verse:
            markers.append(f"{prev_verse['sura_no']}:{prev_verse['aya_no']}")
    prev_verse = verse

# Résultat: 434 marqueurs (ex: 2:15, 2:24, 2:32, 2:40, 2:52...)
```

#### Premiers marqueurs (Sourate Al-Baqara)

```
2:15, 2:24, 2:32, 2:40, 2:52, 2:58, 2:65, 2:74, 2:83, 2:90,
2:99, 2:104, 2:112, 2:122, 2:131, 2:140, 2:146, 2:156, 2:164...
```

#### Affichage dans l'app

- **Ornement Thoumn** : SVG étoile/ellipse (32x28px) pour accueillir les numéros à 3 chiffres
- **Cercle standard** : Pour les autres versets (26x26px)
- **Header** : Affiche "الجزء X | الحزب Y | الثمن Z"

### Algorithme de génération (generate_quran_app.py)

```
Pour chaque page:
  1. Grouper les versets par sourate
  2. Pour chaque sourate sur la page:
     a. Si première apparition → ajouter ornement (1 ligne)
     b. Si pas At-Tawba → ajouter basmala (1 ligne)
     c. Distribuer le texte sur les lignes restantes
  3. Total = 15 lignes par page
```

### Viewport mobile - CORRIGÉ ✅

Le problème de la barre du bas tronquée sur mobile est corrigé :
- `height: 100dvh` (dynamic viewport height)
- `min-height: -webkit-fill-available` (fallback iOS Safari)
- `flexShrink: 0` sur header et bottom bar

### Tests E2E - 5/5 PASSENT ✅

```bash
TEST_URL="http://$(docker inspect quran-app ...):5006" npx playwright test e2e/bug-fixes.spec.ts
```

## Fonctionnalités implémentées

### Navigation
- [x] Swiper.js pour navigation swipe (web)
- [x] PagerView pour swipe natif (mobile)
- [x] Menu avec liste des 114 sourates
- [x] Navigation instantanée vers une sourate (speed=0)
- [x] Header avec titre sourate et numéro de page
- [x] Navigation clavier (← → pour pages, H pour masquer)

### Affichage Mushaf
- [x] 15 lignes par page (standard KFGQPC)
- [x] Ornement décoratif pour chaque sourate
- [x] Basmala sur ligne dédiée (113 sourates)
- [x] Police KFGQPC-Warsh via CDN
- [x] Numéros de versets en cercles verts
- [x] Cadre décoratif style Mushaf
- [x] Mode clair/sombre
- [x] Responsive (clamp pour taille police)

### Bottom Bar
- [x] Bouton Play (préparé pour récitation)
- [x] Boutons Peek (❮ ❯)
- [x] Bouton masquer/afficher (👁)
- [x] Bouton paramètres
- [x] Nom du récitateur

### À implémenter
- [ ] Persistance de la page courante (localStorage)
- [ ] Bookmarks
- [ ] Recherche dans le Coran
- [ ] Mode récitation avec highlight mot courant
- [ ] Audio récitation (API Quran.com)
- [ ] Mode mémorisation (mots masqués)

## Avantages vs Expo

| Aspect | Expo | React Native CLI |
|--------|------|------------------|
| Builds | Instables, cloud | Locaux, reproductibles |
| Logs | Difficile d'accès | `adb logcat` direct |
| Native modules | Limités | Tous disponibles |
| Taille APK | ~50+ MB | ~20-30 MB |
| Debug | EAS required | Android Studio/Xcode |

## Debugging

### Metro bundler ne démarre pas

```bash
# Nettoyer le cache
npm start -- --reset-cache
```

### Build Android échoue

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Erreur "Unable to load script"

```bash
# Sur émulateur Android
adb reverse tcp:8081 tcp:8081
```

## Tests

### Tests unitaires

```bash
npm test
npm run lint
```

### Tests E2E avec Playwright

Les tests E2E vérifient l'interface utilisateur avec des captures d'écran automatiques.

#### Configuration

```bash
# Installer Playwright (une seule fois)
npx playwright install chromium
```

#### Exécuter les tests E2E

```bash
# Depuis le dossier QuranWarshApp
cd /home/coder/workspace/quran-app-research/QuranWarshApp

# IMPORTANT: Toujours utiliser l'URL publique (pas l'IP du conteneur)
# L'IP du conteneur n'est pas accessible depuis code-server (réseaux Docker séparés)

# Lancer tous les tests E2E
TEST_URL="https://quran.azimetech.com" npx playwright test --reporter=line

# Lancer un test spécifique
TEST_URL="https://quran.azimetech.com" npx playwright test e2e/bug-fixes.spec.ts
```

#### Structure des tests E2E

```
e2e/
├── bug-fixes.spec.ts      # Tests des corrections de bugs
├── menu-animation-test.spec.ts  # Test animation menu
├── quran.spec.ts          # Tests navigation basique
└── screenshot.spec.ts     # Captures d'écran
```

#### Tests disponibles (bug-fixes.spec.ts)

| Test | Description |
|------|-------------|
| 1. Ornements sourates | Vérifie que les bandeaux verts s'affichent sur page 604 |
| 2. Largeur lignes | Vérifie que les lignes remplissent toute la largeur |
| 3. Boutons bottom bar | Vérifie présence des boutons ▶, ❮, ❯, ⚙️ |
| 4. Navigation directe | Vérifie navigation instantanée (<500ms) vers sourate |
| 5. Vérification visuelle | Capture complète de page 604 |

#### Screenshots automatiques

Les captures d'écran sont sauvegardées dans `e2e-screenshots/`:

```
e2e-screenshots/
├── bugfix-page604-ornaments.png   # Page 604 avec ornements
├── bugfix-line-width.png          # Largeur des lignes
├── bugfix-bottom-bar.png          # Barre du bas
├── bugfix-direct-navigation.png   # Après navigation
├── menu-open.png                  # Menu ouvert
└── menu-closed.png                # Menu fermé
```

#### Workflow de développement recommandé

1. **Modifier le code** dans `App.web.tsx`
2. **Builder l'app** : `npm run web:build`
3. **Déployer** :
   ```bash
   cp -r dist/* ../quran-app/docker/
   cd ../quran-app && docker-compose build --no-cache && docker-compose up -d
   ```
4. **Lancer les tests E2E** (utiliser l'URL publique) :
   ```bash
   TEST_URL="https://quran.azimetech.com" npx playwright test
   ```
5. **Vérifier les screenshots** dans `e2e-screenshots/`
6. **Commiter** si tous les tests passent

#### Ajouter un nouveau test

```typescript
// e2e/mon-test.spec.ts
import { test, expect } from '@playwright/test';

test('Ma fonctionnalité', async ({ page }) => {
  // IMPORTANT: Utiliser l'URL publique, pas localhost (réseaux Docker séparés)
  const baseUrl = process.env.TEST_URL || 'https://quran.azimetech.com';

  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  // Actions utilisateur
  await page.click('button:has-text("☰")');
  await page.waitForTimeout(400);

  // Capture d'écran
  await page.screenshot({ path: 'e2e-screenshots/mon-test.png' });

  // Assertions
  await expect(page.locator('text=السور')).toBeVisible();
});
```

---

*Créé le 01/02/2026 - Mis à jour le 01/02/2026*

---

## REFACTORING EN COURS (01/02/2026)

### Objectif : Support multi-riwaya (Warsh + Hafs)

#### Fichier créé : `src/config/riwayaConfig.ts`

Centralise toutes les valeurs spécifiques à chaque riwaya :

```typescript
interface RiwayaConfig {
  id: 'warsh' | 'hafs';
  name: string;
  nameAr: string;
  totalPages: number;           // 604 Warsh, variable Hafs
  linesPerPage: number;         // 15
  specialPages: number[];       // [1, 2] pour Al-Fatiha
  specialPagesLineCount: number; // 6 lignes de texte
  fontFamily: string;           // KFGQPC-Warsh ou KFGQPC-Hafs
  thoumnMarkers: Set<string>;   // 434 marqueurs Warsh
  hizbStartPages: number[];     // 60 valeurs par riwaya
  accentColor: string;          // #12D084
  supportsTajweedColors: boolean; // true pour Hafs
}
```

#### Modifications dans App.web.tsx

Remplacer les valeurs hardcodées par `riwayaConfig.*` :

| Avant | Après |
|-------|-------|
| `KFGQPC-Warsh, Traditional Arabic, serif` | `riwayaConfig.fontFamily` |
| `pageNumber === 1 \|\| pageNumber === 2` | `riwayaConfig.specialPages.includes(pageNumber)` |
| `LINES_COUNT = 6` | `riwayaConfig.specialPagesLineCount` |
| `page.total_lines \|\| 15` | `page.total_lines \|\| riwayaConfig.linesPerPage` |
| `THOUMN_MARKERS_WARSH` | `isThoumnMarker(sura, aya)` (importé) |
| `getQuranPosition(page)` | `getQuranPosition(page, CURRENT_RIWAYA)` (importé) |

#### État du refactoring

- [x] Fichier `riwayaConfig.ts` créé avec config Warsh complète
- [x] Import ajouté dans App.web.tsx
- [x] `fontFamily` → `riwayaConfig.fontFamily` (7 occurrences)
- [x] `isSpecialPage` → utilise `riwayaConfig.specialPages`
- [x] `LINES_COUNT` → `riwayaConfig.specialPagesLineCount`
- [x] `total_lines || 15` → `riwayaConfig.linesPerPage` (3 occurrences)
- [ ] Build et test à faire

---

## FEATURE RECITATION (À IMPLÉMENTER)

### UI Simplifiée demandée

1. **Bottom bar** :
   - Bouton enregistrement (🎤) à DROITE (pas à gauche)
   - Style CSS pulse conservé
   - Autres boutons masqués jusqu'au lancement de session

2. **Mode récitation** :
   - Au lancement : tous les mots masqués (cercles gris)
   - Révélation mot par mot selon reconnaissance vocale
   - Si erreur : vibration + mot suivant en ROUGE
   - Attente 10s pour correction, sinon re-vibration + flash rouge
   - Bouton aide (💡) : révèle mot suivant en VERT

3. **Navigation** :
   - Page complètement récitée → auto-swipe page suivante
   - Retour manuel sur pages déjà récitées (mots visibles)

### Workflow Tarteel analysé

```
[1] Tap bouton 🎤 → mode récitation activé
[2] Mots deviennent ⊙ ⊙ ⊙ ⊙ (cercles gris)
[3] Utilisateur parle → STT reconnaît
[4] Mot correct → révélé en noir
[5] Mot incorrect → ROUGE + vibration + attente correction
[6] Bouton aide → révèle 1 mot en VERT
[7] Page terminée → swipe auto page suivante
```

### Icônes à ajouter

- **MicIcon** : Microphone pour enregistrement
- **HelpIcon** : Ampoule/question pour aide (révéler mot)
- **StopIcon** : Carré pour arrêter session

### États des mots CSS

```css
.word-hidden { background: #D4D0C8; border-radius: 50%; } /* Cercle gris */
.word-current { background: #12D084; color: white; }      /* En cours */
.word-correct { color: #1A1614; }                         /* Révélé OK */
.word-error { color: #DC3545; animation: flash 0.5s; }   /* Erreur */
.word-help { color: #12D084; }                           /* Aide */
```

---

## Commits récents

- `b1755ca` - Feat(pages): special layout for pages 1-2 with 6 lines of text
- `d32841f` - Initial commit - Quran Warsh App

GitHub: https://github.com/stephfun/quran-warsh.git
