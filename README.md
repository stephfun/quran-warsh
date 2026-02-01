# Quran Warsh App

Application de lecture du Coran en riwaya Warsh, développée avec React Native (mobile) et React + Vite (web).

## Captures d'écran

<p align="center">
  <img src="docs/screenshot-page24.png" alt="Page 24" width="400">
</p>

## Fonctionnalités

- **604 pages** du Mushaf Warsh KFGQPC
- **15 lignes par page** (format traditionnel)
- **Police KFGQPC-Warsh** officielle
- **Navigation swipe** fluide
- **Menu des 114 sourates**
- **Mode clair/sombre**
- **Marqueurs Thoumn** (434 divisions)
- **Responsive** (mobile, tablette, desktop)

## Démo

- **Production** : https://quran.azimetech.com
- **Local** : http://localhost:5006

## Installation

```bash
# Cloner le repo
git clone https://github.com/stephfun/quran-warsh-app.git
cd quran-warsh-app

# Installer les dépendances
npm install

# Lancer en mode développement (web)
npm run web:dev

# Builder pour production
npm run web:build
```

## Architecture

```
quran-warsh-app/
├── App.tsx          # Version mobile (React Native)
├── App.web.tsx      # Version web (React + Vite)
├── src/
│   ├── components/  # Composants React
│   ├── data/        # Données Quran (604 pages)
│   └── types/       # Types TypeScript
├── e2e/             # Tests E2E (Playwright)
├── docker/          # Configuration Docker
└── CLAUDE.md        # Documentation technique
```

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | React Native CLI 0.83 |
| Web bundler | Vite 7 |
| Swipe (mobile) | react-native-pager-view |
| Swipe (web) | Swiper.js |
| Tests E2E | Playwright |
| Déploiement | Docker + nginx |

## Données du Coran

Les données sont basées sur le **Mushaf KFGQPC Warsh** :

- Source : [quran-data-kfgqpc](https://github.com/AliMustafa731/quran-data-kfgqpc)
- Police : KFGQPC Uthmanic Warsh v10
- 6,218 versets, 77,861 mots

## Marqueurs de division (Thoumn)

L'application affiche les 434 marqueurs de division Thoumn (ثمن = 1/8 de Hizb) avec un ornement spécial.

| Division | Quantité |
|----------|----------|
| Juz (جزء) | 30 |
| Hizb (حزب) | 60 |
| Thoumn (ثمن) | 434 |

## Déploiement Docker

```bash
# Builder l'image
docker-compose build

# Lancer le conteneur
docker-compose up -d

# Accéder à l'app
open http://localhost:5006
```

## Tests

```bash
# Tests E2E
TEST_URL="http://localhost:5006" npx playwright test

# Lint
npm run lint
```

## Contribuer

Les contributions sont les bienvenues ! Voir [CLAUDE.md](CLAUDE.md) pour la documentation technique détaillée.

## Licence

MIT

## Crédits

- Police et données : [KFGQPC](https://fonts.qurancomplex.gov.sa/)
- Inspiration UI : [Tarteel](https://tarteel.ai/)
