# App native (Android/iOS) — build local, publiable sur les stores

Wrapper Capacitor qui embarque le build de l'app directement dans le binaire
(pas une TWA qui charge une URL distante). Résultat : le calculateur, le
planificateur, la collection, les teams et le tracker fonctionnent **à 100%
hors-ligne, pour toujours** — même si l'hébergement web meurt.

**Testé de bout en bout dans cet environnement** : build réel, APK généré,
contenu vérifié (fichiers inclus/exclus corrects, service worker patché
présent). Pas de virtualisation matérielle disponible ici pour lancer un
émulateur — un test d'installation sur un vrai appareil/émulateur reste à
faire avant publication.

## Pourquoi `dist-native/` et pas juste `dist/`

Le dossier `public/` de l'app contient 4 sous-dossiers volumineux, chargés à
la demande sur le web mais qui rendraient l'app native ingérable si bundlés
tels quels :

| Dossier | Taille | Utilisé pour |
|---|---|---|
| `map-tiles/` | 725 MB | Tuiles de la carte interactive |
| `portraits/` | 155 MB | Animations Spine des personnages |
| `animated-bg/` | 125 MB | Fonds animés (vidéos) des bannières |
| `spine/` | 86 MB | Fichiers d'animation Spine |

Bundler tout → **APK de ~1 GB**, testé et confirmé ingérable pour les stores.
`capacitor-build/build.mjs` construit donc un `dist-native/` filtré (~5 MB,
tout le reste inchangé) et patche le service worker embarqué pour que toute
requête vers ces 4 dossiers soit automatiquement redirigée vers ton
déploiement hébergé au lieu de chercher des fichiers absents localement —
**aucun changement nécessaire** dans le code qui référence ces chemins
(`banners.js`, `SpinePlayer.jsx`, la carte).

Résultat mesuré : **APK de 7 MB** (contre 1 GB en bundlant tout).

## Ce qui marche offline vs ce qui a besoin du réseau

| Fonctionnalité | Offline (toujours) |
|---|---|
| Calculateur, Planificateur | ✅ |
| Collection, Teams, Tracker | ✅ |
| Base de données personnages/armes/echoes | ✅ |
| Carte interactive | ❌ tuiles chargées depuis ton hosting |
| Animations Spine des personnages | ❌ chargées depuis ton hosting |
| Fonds animés des bannières | ❌ chargées depuis ton hosting |
| Suppression de fond d'image, proxy gacha (récupération de l'historique) | ❌ appellent `/api/*` sur ton hosting (choix fait : pas de clé API perso embarquée) |
| OCR gacha (lecture de l'URL depuis une capture d'écran) | ✅ 100% sur l'appareil via Tesseract.js (assets vendorisés dans `public/vendor/tesseract/`, précachés à l'install) — aucun appel réseau pour l'OCR lui-même ; seule la récupération de l'historique APRÈS extraction de l'URL a besoin du réseau |
| Notifications push | ❌ nécessite `google-services.json` + config Firebase côté serveur (voir ci-dessous) |

## Notifications push

Le client (permission, enregistrement FCM, écouteurs) est entièrement câblé, mais
**deux choses côté serveur/config sont nécessaires** avant qu'une notification
puisse réellement arriver sur un appareil :

### 1. Projet Firebase + `google-services.json`
1. Crée un projet sur [Firebase Console](https://console.firebase.google.com/)
   (ou réutilise celui déjà lié à `VITE_FIREBASE_DB`)
2. Ajoute une app Android avec le package `cc.andene.whisperingwishes`
3. Télécharge `google-services.json` et place-le dans `app/android/app/`
   (déjà dans `.gitignore` — jamais commité)

### 2. Variables d'environnement serveur (Vercel — jamais préfixées `VITE_`)
| Variable | D'où la sortir |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Paramètres du projet → Comptes de service → "Générer une nouvelle clé privée" — colle le JSON entier comme valeur (une seule ligne) |
| `FIREBASE_DB_URL` | Même URL que `VITE_FIREBASE_DB`, mais en variable serveur séparée (les `VITE_*` ne sont embarquées que côté client, pas dans le runtime Vercel) |
| `PUSH_ADMIN_SECRET` | Une chaîne aléatoire de ton choix (`openssl rand -hex 32`) — protège `/api/push/send` |

Une fois les deux en place : ouvrir l'app une fois enregistre le token de
l'appareil (`push-tokens/{token}` dans Realtime Database, via
`/api/push/register`), puis envoyer un test :
```bash
curl -X POST https://ton-app.vercel.app/api/push/send \
  -H "x-admin-secret: $PUSH_ADMIN_SECRET" -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Ça marche !"}'
```
`/api/push/send` n'est jamais appelé par l'app elle-même — c'est un outil
d'admin (curl manuel, ou un Vercel Cron qui poste avec un titre/texte calculé
depuis les événements qui se terminent bientôt).

## Build

### 1. Prérequis
- Node.js LTS
- Pour Android : [Android Studio](https://developer.android.com/studio) (inclut le SDK)
- Pour iOS : un Mac avec Xcode (non scaffoldé pour l'instant — voir §5)

### 2. Configurer l'URL de ton déploiement hébergé
```bash
cd app
echo "VITE_API_BASE_URL=https://ton-app.vercel.app" > .env.local
```
C'est l'URL que l'app native utilisera pour la carte, les animations, les
fonds de bannières, et les 3 features `/api/*`. Doit être accessible depuis
internet (Vercel, ou ton self-host exposé via un tunnel — voir
`SELF_HOSTING.md`).

### 3. Builder
```bash
npm install
npm run build:native      # produit dist-native/, patché
npm run cap:sync          # copie dist-native/ dans android/
```

### 4. Générer l'APK
```bash
npm run cap:open          # ouvre le projet dans Android Studio
```
Dans Android Studio : Build → Generate Signed Bundle / APK.

Ou en ligne de commande (build de debug, non signé pour le store) :
```bash
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```
Pour publier sur Google Play, il faut un **build signé** (release, pas
debug) — Android Studio guide à travers la création d'une clé de signature
lors du "Generate Signed Bundle".

### 5. iOS
Pas scaffoldé (nécessite un Mac + Xcode, indisponibles ici). Une fois sur un
Mac avec le repo :
```bash
npm install @capacitor/ios
npx cap add ios
npm run build:native && npx cap sync ios
npx cap open ios
```
Mêmes fichiers `dist-native/`/`capacitor.config.json` réutilisés tels quels.

## Avant de publier

- **Icônes/splash screen** : générés à partir de `assets/icon.png` (le vrai
  logo de l'app, pas le placeholder Capacitor par défaut) via
  `npm run icons` (`@capacitor/assets`). Pour changer l'icône : remplace
  `assets/icon.png` (idéalement 1024×1024) et relance `npm run icons`, puis
  commit les fichiers générés sous `android/app/src/main/res/`.
- **Test réel** : installer l'APK debug sur un appareil/émulateur et vérifier
  que la carte/les animations/les fonds de bannière se chargent bien depuis
  `VITE_API_BASE_URL` — non testé en exécution réelle dans cet environnement.
- **Compte développeur Google Play** : 25$ (paiement unique) —
  https://play.google.com/console/signup

## Fichiers ajoutés/modifiés

- `capacitor.config.json` — config Capacitor (`webDir: dist-native`)
- `capacitor-build/build.mjs` — build filtré + patch du service worker
- `android/` — projet natif Android (généré par `npx cap add android`)
- `src/utils/apiBase.js` — résout `/api/*` vers `VITE_API_BASE_URL` uniquement
  quand l'app tourne dans Capacitor (`window.Capacitor.isNativePlatform()`) ;
  inchangé sur le web (chemins relatifs, même comportement qu'avant)
- `api/_common.js` — ajout de `capacitor://localhost` / `https://localhost`
  (origines fixes de la WebView Capacitor) à l'allowlist CORS existante
