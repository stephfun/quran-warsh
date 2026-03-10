# Setup Guide - Quran Warsh App on Windows

Guide complet pour configurer et continuer le développement de l'app Quran Warsh sur un PC Windows avec Claude Code.

---

## 1. Prérequis à installer

### Obligatoires

| Outil | Version minimale | Installation | Vérification |
|-------|-----------------|--------------|--------------|
| **Node.js** | >= 20.x (LTS recommandé) | https://nodejs.org/ | `node --version` |
| **npm** | >= 10.x (inclus avec Node) | Inclus avec Node.js | `npm --version` |
| **Git** | >= 2.40 | https://git-scm.com/download/win | `git --version` |
| **VS Code** | Latest | https://code.visualstudio.com/ | - |
| **Claude Code** | Latest | `npm install -g @anthropic-ai/claude-code` | `claude --version` |

### Optionnels (pour le développement mobile)

| Outil | Version | Installation |
|-------|---------|--------------|
| **Android Studio** | Latest | https://developer.android.com/studio |
| **JDK** | 17 | Inclus avec Android Studio |
| **Android SDK** | API 34+ | Via Android Studio SDK Manager |

### Optionnels (pour les tests E2E)

| Outil | Installation |
|-------|--------------|
| **Playwright** | `npx playwright install chromium` (après npm install) |

---

## 2. Cloner et configurer le projet

```powershell
# Cloner le repo
git clone https://github.com/stephfun/quran-warsh.git quran-warsh-app
cd quran-warsh-app

# Installer les dépendances
npm install

# Installer Playwright pour les tests E2E (optionnel)
npx playwright install chromium
```

---

## 3. Lancer le projet (mode développement web)

```powershell
# Démarrer le serveur de dev Vite
npm run web

# L'app sera accessible sur http://localhost:5006
```

### Autres commandes utiles

```powershell
# Build production web
npm run web:build

# Preview du build production
npm run web:preview

# Lancer les tests E2E (nécessite le serveur de dev actif)
npm run test:e2e

# Linting
npm run lint
```

---

## 4. Lancer le projet (mode mobile Android)

```powershell
# Prérequis : Android Studio + émulateur configuré
# Variables d'environnement Windows à configurer :
# ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
# PATH += %ANDROID_HOME%\platform-tools

# Démarrer Metro bundler
npm start

# Dans un autre terminal, lancer sur l'émulateur Android
npm run android
```

---

## 5. Structure du projet

```
quran-warsh-app/
├── App.tsx              # Version MOBILE (React Native + PagerView)
├── App.web.tsx          # Version WEB (React + Swiper.js) ← fichier principal
├── index.html           # Point d'entrée web (charge la police KFGQPC Warsh via CDN)
├── src/
│   ├── index.web.tsx    # Bootstrapping web (ReactDOM.render)
│   ├── config/
│   │   └── riwayaConfig.ts   # Config multi-riwaya (Warsh/Hafs) + couleurs + marqueurs
│   ├── components/
│   │   └── QuranPage.tsx     # Composant page Mushaf (mobile)
│   ├── data/
│   │   └── quranData.ts      # 604 pages du Coran Warsh (9.2 MB, généré)
│   ├── services/
│   │   ├── recitationStorage.ts  # IndexedDB pour progression récitation
│   │   └── sessionStorage.ts     # Gestion sessions récitation
│   ├── types/
│   │   └── index.ts          # Types TypeScript (Page, Surah, Word, etc.)
│   ├── assets/fonts/         # Polices (chargées via CDN en web)
│   ├── screens/              # Vide (pour futures screens mobile)
│   └── utils/                # Vide (pour futurs utilitaires)
├── e2e/                      # Tests E2E Playwright (14 fichiers)
├── e2e-screenshots/          # Captures d'écran des tests (gitignored)
├── docker/                   # Dockerfile pour le déploiement production
├── docker-compose.yml        # Orchestration conteneur production
├── vite.config.ts            # Config Vite (port 5006, alias react-native → react-native-web)
├── playwright.config.ts      # Config Playwright (Chromium, base URL via TEST_URL)
├── tsconfig.json             # Config TypeScript (extends @react-native/typescript-config)
├── babel.config.js           # Config Babel (preset react-native)
├── metro.config.js           # Config Metro bundler (mobile)
├── .eslintrc.js              # ESLint (extends @react-native)
├── .prettierrc.js            # Prettier (singleQuote, trailingComma)
└── CLAUDE.md                 # Documentation complète du projet
```

---

## 6. Architecture technique

### Cross-platform (Web + Mobile)

Le bundler sélectionne automatiquement le bon fichier :
- **Vite** (web) → `App.web.tsx` (2381 lignes)
- **Metro** (mobile) → `App.tsx`

L'alias `react-native → react-native-web` dans `vite.config.ts` permet d'utiliser les composants React Native sur le web.

### Stack

| Composant | Web | Mobile |
|-----------|-----|--------|
| Navigation swipe | Swiper.js 12 | react-native-pager-view 8 |
| Rendering | React DOM 19 | React Native 0.83 |
| Build | Vite 7.3 | Metro |
| Tests E2E | Playwright 1.58 | - |

### Données du Coran

- **604 pages** structurées en 15 lignes chacune
- Données générées par `generate_quran_app.py` (dans un repo séparé `quran-app-research`)
- Le fichier `src/data/quranData.ts` fait 9.2 MB (ne pas l'éditer manuellement)
- Police **KFGQPC Warsh** chargée via CDN (jsdelivr)

### Configuration multi-riwaya

Le fichier `src/config/riwayaConfig.ts` centralise :
- Polices, couleurs, nombre de pages
- 434 marqueurs Thoumn (divisions du Coran)
- Tables de début de Hizb (60 valeurs)
- Support prêt pour Hafs (à compléter)

La riwaya active est définie dans `App.web.tsx` :
```typescript
const CURRENT_RIWAYA: RiwayaType = 'warsh';
```

---

## 7. État actuel du développement (Mars 2026)

### Fonctionnalités terminées ✅

| Fonctionnalité | Description |
|----------------|-------------|
| **Affichage Mushaf** | 604 pages, 15 lignes/page, ornements sourates, basmala |
| **Navigation** | Swipe, menu 114 sourates, navigation directe, clavier (← → H) |
| **Pages spéciales** | Pages 1-2 (Al-Fatiha/Al-Baqara) avec 6 lignes de texte |
| **Marqueurs Thoumn** | 434 marqueurs avec ornement étoile, header Juz/Hizb/Thoumn |
| **Mode clair/sombre** | Toggle dans les paramètres |
| **Menu paramètres** | Thème + sélection riwaya (Warsh/Hafs) |
| **Cadre Mushaf** | Bordure décorative style livre |
| **Responsive** | Taille police adaptative (clamp CSS) |
| **Config multi-riwaya** | Architecture prête pour Warsh + Hafs |

### En cours de développement 🔧

| Fonctionnalité | État | Détails |
|----------------|------|---------|
| **Mode récitation** | Phase 1 en cours | Voir section dédiée ci-dessous |
| **Services storage** | Créés, non commités | `src/services/recitationStorage.ts` et `sessionStorage.ts` |

### Feature récitation - Phase 1 (EN COURS)

L'implémentation de la récitation est dans `App.web.tsx` (non commité, +978 lignes).

#### Concept

```
[1] Tap bouton 🎤 → mode récitation activé
[2] Mots deviennent ⊙ ⊙ ⊙ (cercles gris = masqués)
[3] Utilisateur parle → reconnaissance vocale (STT)
[4] Mot correct → révélé en noir
[5] Mot incorrect → ROUGE + vibration + attente correction (10s)
[6] Bouton aide (💡) → révèle 1 mot en VERT
[7] Page terminée → auto-swipe page suivante
```

#### UI implémentée

- **Bouton micro** (🎤) dans la bottom bar à DROITE, avec animation pulse verte
- **Mots masqués** : background gris arrondi quand mode récitation actif
- **Bouton aide** : révèle le mot suivant en vert
- **Indication erreur** : flash rouge sur mot incorrect
- **Auto-swipe** : navigation automatique quand page complète

#### Services IndexedDB créés

- `recitationStorage.ts` : Sauvegarde progression par page (mots révélés, erreurs)
- `sessionStorage.ts` : Gestion sessions (création, pause, reprise, historique)

#### Ce qui reste à faire

- [ ] **Intégration STT** (Speech-to-Text) : Web Speech API ou service externe
- [ ] **Matching vocal ↔ texte arabe** : Algorithme de comparaison phonétique
- [ ] **Vibration** : Navigator.vibrate() pour signaler les erreurs
- [ ] **Persistance page courante** : localStorage
- [ ] **Tests E2E récitation** : Fichiers créés mais à compléter
- [ ] **Mode Hafs** : Données et police à intégrer
- [ ] **Bookmarks**
- [ ] **Recherche dans le Coran**

### Fichiers non commités (changements en cours)

| Fichier | Description |
|---------|-------------|
| `App.web.tsx` | +978 lignes : feature récitation phase 1 |
| `src/services/recitationStorage.ts` | Nouveau : IndexedDB pour progression (368 lignes) |
| `src/services/sessionStorage.ts` | Nouveau : Gestion sessions récitation (240 lignes) |
| `e2e/recitation-phase1.spec.ts` | Nouveau : Tests E2E récitation (559 lignes) |
| `e2e/recitation-scenarios.spec.ts` | Nouveau : Tests scénarios récitation (179 lignes) |
| `e2e/mic-button-test.spec.ts` | Nouveau : Test bouton micro (14 lignes) |

---

## 8. Commandes de développement rapide

```powershell
# === Développement quotidien ===
npm run web                    # Démarrer le serveur de dev (http://localhost:5006)

# === Tests ===
npm run test:e2e               # Tests E2E locaux (serveur de dev doit tourner)
npm run lint                   # Vérifier le code

# === Build ===
npm run web:build              # Build production dans dist/
npm run web:preview            # Prévisualiser le build production

# === Mobile (si Android Studio configuré) ===
npm start                      # Démarrer Metro bundler
npm run android                # Lancer sur émulateur Android
```

---

## 9. Configuration VS Code recommandée

### Extensions à installer

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **TypeScript** (inclus dans VS Code)
- **React Native Tools** (msjsdiag.vscode-react-native)

### Settings recommandés (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.web.tsx": "typescriptreact"
  }
}
```

---

## 10. Points d'attention Windows

### Chemins longs

Windows a une limite de 260 caractères pour les chemins. Si `npm install` échoue :

```powershell
# Activer les chemins longs dans Git
git config --system core.longpaths true

# Ou dans le registre Windows (PowerShell admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Fins de ligne (CRLF vs LF)

Configurer Git pour utiliser LF (comme le repo existant) :

```powershell
git config --global core.autocrlf input
```

### Police KFGQPC Warsh

La police est chargée via **CDN** (pas de fichier local nécessaire) :
```
https://cdn.jsdelivr.net/gh/thetruetruth/quran-data-kfgqpc@main/warsh/font/warsh.10.woff2
```
Aucune installation locale requise. Il faut juste une connexion internet.

### Port 5006

Vérifier qu'aucun autre process n'utilise le port 5006 :

```powershell
netstat -ano | findstr :5006
```

---

## 11. Déploiement (optionnel sur Windows)

Le déploiement Docker est configuré pour le serveur NAS (192.168.1.28). Sur Windows, tu peux :

1. **Développer et tester localement** avec `npm run web`
2. **Pousser sur GitHub** : `git push origin main`
3. **Déployer depuis le serveur** (NAS) via SSH ou depuis code-server

Le Dockerfile et docker-compose.yml sont inclus mais ne sont nécessaires que pour le déploiement production sur le NAS.

---

## 12. Workflow recommandé avec Claude Code

```powershell
# 1. Ouvrir un terminal dans le dossier du projet
cd quran-warsh-app

# 2. Lancer Claude Code
claude

# 3. Demander à Claude de continuer le développement
# Exemples de prompts :
#   "Continue la feature récitation phase 1"
#   "Intègre la Web Speech API pour la reconnaissance vocale"
#   "Lance le serveur de dev et les tests E2E"
#   "Montre-moi l'état actuel du projet"
```

---

## 13. Repo GitHub

- **URL** : https://github.com/stephfun/quran-warsh.git
- **Branche principale** : `main`
- **Dernier commit** : `f0a5b04` - Feat: add settings menu with theme and riwaya selection

---

*Guide généré le 10/03/2026 pour export vers Windows*
