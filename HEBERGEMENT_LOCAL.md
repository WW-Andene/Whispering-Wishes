# Héberger Whispering Wishes sur son propre PC

Guide complet pour faire tourner l'app en local (build de production, pleine
puissance de ta machine, zéro dépendance à Vercel) et l'exposer sur internet si
besoin. **Ne touche à rien côté Vercel** — le déploiement Vercel continue de
fonctionner normalement en parallèle si tu veux garder les deux.

---

## 1. Prérequis

Installe [Node.js LTS](https://nodejs.org) (v20 ou plus récent) si ce n'est pas
déjà fait.

## 2. Récupérer le projet et installer les dépendances

```bash
git clone https://github.com/WW-Andene/Whispering-Wishes.git
cd Whispering-Wishes/app
npm install
```

## 3. (Optionnel) Configurer les clés API côté client

Ces clés sont lues **au moment du build** (`npm run build`), elles doivent donc
être en place *avant* de builder. Aucune n'est obligatoire — sans elles, tout
fonctionne sauf la sauvegarde cloud / connexion Google.

Crée `app/.env.local` :

**PowerShell / CMD (Windows) :**
```powershell
copy nul .env.local
notepad .env.local
```

**Git Bash / Mac / Linux :**
```bash
touch .env.local
```

Contenu à mettre dedans (uniquement les lignes dont tu as besoin) :
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_DB=
VITE_GOOGLE_CLIENT_ID=
VITE_FLAG_CLOUD_BACKUP=true
```

| Clé | À quoi ça sert | Obligatoire ? |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Sauvegarde cloud (backup/restore) via Firebase | Non |
| `VITE_FIREBASE_DB` | URL de la Realtime Database Firebase associée | Non |
| `VITE_GOOGLE_CLIENT_ID` | Connexion Google (identifie l'utilisateur pour la sauvegarde cloud) | Non |
| `VITE_FLAG_CLOUD_BACKUP` | Active/désactive explicitement la sauvegarde cloud | Non (activée par défaut si Firebase est configuré) |

Si tu ne comptes pas utiliser la sauvegarde cloud, **saute cette étape entièrement**.

## 4. Builder l'app

```bash
npm run build
```
Génère `dist/` — le même build optimisé/minifié que celui qui tourne sur Vercel.

## 5. Configurer les clés API côté serveur (optionnel)

Ces clés sont lues au runtime par le petit serveur Express fourni
(`self-host/server.js`), jamais exposées au navigateur.

**PowerShell :**
```powershell
copy self-host\.env.example self-host\.env
notepad self-host\.env
```

**CMD :**
```cmd
copy self-host\.env.example self-host\.env
notepad self-host\.env
```

**Git Bash / Mac / Linux :**
```bash
cp self-host/.env.example self-host/.env
```

| Clé | À quoi ça sert | Obligatoire ? | Où l'obtenir |
|---|---|---|---|
| `HF_API_KEY` | Suppression de fond d'image (onglet Collection) | Non | https://huggingface.co/settings/tokens (gratuit) |
| `GROQ_API_KEY` | OCR — scan d'URL gacha depuis un screenshot | Non | https://console.groq.com/keys (gratuit) |
| `ADMIN_HASH` | Outil admin de suppression de fond en masse | Non | Le hash que ton panneau admin attend |
| `PORT` | Port du serveur | Non (défaut `4173`) | — |
| `HOST` | Adresse d'écoute du serveur | Non (défaut `0.0.0.0`) | — |
| `EXTRA_ALLOWED_ORIGINS` | Autoriser une autre URL à appeler `/api/*` | Seulement si tu exposes l'app ailleurs qu'en local (voir §7) | — |

`VITE_SENTRY_DSN` existe en commentaire dans le code mais n'est branché nulle
part actuellement — ignore-le.

**Usage courant sans rien configurer de spécial** : laisse tout vide sauf
`HF_API_KEY` et/ou `GROQ_API_KEY` si tu utilises ces deux features précises.

## 6. Lancer le serveur

```bash
npm run selfhost
```
L'app tourne sur **http://localhost:4173**.

---

## 7. Rendre l'app accessible depuis internet (optionnel)

### Option recommandée — Cloudflare Tunnel
Gratuit, HTTPS automatique, pas besoin d'ouvrir de port sur ta box, cache ton IP.

```bash
# télécharge cloudflared : https://github.com/cloudflare/cloudflared/releases
cloudflared tunnel --url http://localhost:4173
```
Donne une URL du style `https://xxxx.trycloudflare.com` immédiatement, sans compte.

Pour une URL fixe sur ton propre nom de domaine :
```bash
cloudflared tunnel login
cloudflared tunnel create whispering-wishes
cloudflared tunnel route dns whispering-wishes wuwa.tondomaine.com
```
Puis un fichier `config.yml` :
```yaml
tunnel: whispering-wishes
credentials-file: /chemin/vers/<tunnel-id>.json
ingress:
  - hostname: wuwa.tondomaine.com
    service: http://localhost:4173
  - service: http_status:404
```
```bash
cloudflared tunnel run whispering-wishes
```

**Important** : quelle que soit l'URL obtenue, ajoute-la dans
`self-host/.env` puis relance le serveur :
```
EXTRA_ALLOWED_ORIGINS=https://xxxx.trycloudflare.com
```
Sans ça, les appels `/api/*` (suppression de fond, OCR) depuis cette URL
seront refusés (403).

### Alternative rapide — ngrok
```bash
ngrok http 4173
```
Plus simple pour un test ponctuel, mais l'URL gratuite change à chaque
redémarrage.

### Alternative — Tailscale Funnel
Si tu utilises déjà Tailscale :
```bash
tailscale funnel 4173      # exposition publique
tailscale serve 4173       # OU accès privé, juste toi/tes appareils, aucune exposition publique
```

### Méthode classique (déconseillée) — Port forwarding + DDNS
Ouvrir un port sur ta box + un service DDNS (No-IP, DuckDNS). Expose ton IP
domestique directement, pas de HTTPS automatique (il faudrait un reverse
proxy type Caddy/nginx + Let's Encrypt en plus). Les options au-dessus sont
plus simples et plus sûres.

---

## 8. Garder le serveur actif en permanence (optionnel)

Pour ne pas devoir laisser un terminal ouvert :

**Windows — pm2 :**
```bash
npm install -g pm2 pm2-windows-startup
pm2-startup install
cd Whispering-Wishes/app
pm2 start self-host/server.js --name whispering-wishes
pm2 save
```
L'app redémarre automatiquement au redémarrage de Windows, et se relance
toute seule si elle plante.

Commandes utiles ensuite :
```bash
pm2 status                        # voir si ça tourne
pm2 logs whispering-wishes        # voir les logs
pm2 restart whispering-wishes     # redémarrer (après un changement de .env par ex.)
pm2 stop whispering-wishes        # arrêter
```

**Linux — pm2 (même commandes) ou un service systemd.**

---

## Récapitulatif express (copier-coller)

```bash
git clone https://github.com/WW-Andene/Whispering-Wishes.git
cd Whispering-Wishes/app
npm install
npm run build
cp self-host/.env.example self-host/.env
# édite self-host/.env si tu veux HF_API_KEY / GROQ_API_KEY
npm run selfhost
```

## Notes

- `npm run selfhost` et Vercel peuvent tourner en même temps, ils ne
  partagent aucune donnée (le localStorage est séparé par origine — donc deux
  sauvegardes distinctes, sauf export/import manuel entre les deux).
- Si tu changes `PORT`/`HOST`, pense à mettre à jour `EXTRA_ALLOWED_ORIGINS`.
- `app/.env.local` et `app/self-host/.env` sont tous les deux ignorés par git
  — jamais commit de vraie clé dedans.
