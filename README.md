# Quizora

Application mobile de quiz (culture générale, défi quotidien, progression).  
Stack : **React Native Community CLI + TypeScript** (sans Expo), ciblée **Android** en premier sur Ubuntu + Android Studio.

Ce dépôt correspond à la **Phase 2** : projet RN CLI propre, prêt à ouvrir et lancer localement. Navigation, Zustand, i18n, backend et pubs arriveront dans les phases suivantes.

## Prérequis (Ubuntu)

| Outil | Notes |
| --- | --- |
| Node.js | ≥ 22.11 (`node -v`) |
| npm | fourni avec Node (`npm -v`) |
| JDK | 17 recommandé pour Android / RN (JDK 21 peut aussi fonctionner) |
| Android Studio | SDK, platform-tools, un AVD (ex. Pixel 7) |

### Variables d’environnement Android

Ajoutez dans `~/.bashrc` (adaptez le chemin si besoin) :

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
```

Puis :

```bash
source ~/.bashrc
adb --version
ls "$ANDROID_HOME"   # build-tools, platform-tools, platforms, emulator…
```

Démarrez un émulateur (ou branchez un appareil en mode débogage USB), puis vérifiez :

```bash
adb devices   # l’appareil doit apparaître en état "device"
```

## Installation

```bash
git clone <url-du-repo>
cd <dossier-du-repo>
npm install
```

Identifiant Android / bundle : `com.quizora.app`.

## Lancer l’app

Deux terminaux (ou un Metro déjà lancé) :

```bash
# Terminal 1 — Metro bundler
npm start

# Terminal 2 — build + install Android
npm run android
```

Commandes utiles :

```bash
npm run lint
npm run typecheck
npm test
```

## Structure (Phase 2)

Projet généré par le template officiel React Native (TypeScript inclus) :

- `App.tsx` — écran de démarrage du template
- `android/` — projet Gradle natif
- `ios/` — présent (template), non prioritaire pour l’instant
- `package.json` — scripts `start`, `android`, `ios`, `lint`, `typecheck`, `test`

Pas encore de `src/` métier, navigation, stores ni i18n.

## Versions utilisées lors du scaffold

- React Native **0.88.0**
- `@react-native-community/cli` **20.2.0**
- Commande d’init :

```bash
npx @react-native-community/cli@latest init Quizora \
  --directory tmp-quizora \
  --pm npm \
  --skip-git-init \
  --install-pods false \
  --package-name com.quizora.app \
  --title Quizora
```

## Dépannage rapide

- **`ANDROID_HOME` non défini** → section variables ci-dessus.
- **`adb devices` vide** → démarrer l’AVD ou autoriser le débogage USB.
- **Build Gradle / JDK** → préférer JDK 17 si la compilation échoue avec une autre version.
- **Metro déjà pris** → `npm start -- --reset-cache`.
