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
| Suppression de fond d'image, OCR gacha, proxy gacha | ❌ appellent `/api/*` sur ton hosting (choix fait : pas de clé API perso embarquée) |

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

- **Icônes/splash screen** : ceux générés sont les placeholders par défaut de
  Capacitor (robot bleu générique) — à remplacer par ceux de l'app avant
  publication. Android Studio a un assistant "Image Asset" pour ça, ou
  [PWABuilder](https://www.pwabuilder.com/imageGenerator) pour générer tous
  les formats d'un coup à partir d'une image source.
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
