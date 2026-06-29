# RUNBOOK — vivokid.ch (Infomaniak Jelastic)

> Aucun secret ici. Tous les secrets sont en variables d'env Jelastic (env `vivokid-prod`, nodeGroup `cp`).

## Topologie
- env `vivokid-prod` (région user2_hn_group) : cp `nodejs22-npm` + bl `nginx` (LB) + sqldb `postgres16`.
- Public : `https://vivokid.ch` + `www` → LB Nginx → cp:8080 → PostgreSQL `kido`.
- Cert : Let's Encrypt (addon sur le LB, nodeGroup `bl`).

## Démarrage
- Launcher natif Jelastic : `PROCESS_MANAGER=npm` + `PORT=8080` → `npm start` (root) → `node server/dist/index.js`.
- L'autoredirect 80→8080 + le proxy LB s'activent via le launcher natif (ne pas lancer pm2 à la main).

## Build / déploiement (sur le nœud cp, /home/jelastic/ROOT)
```
git fetch origin main --depth 1 && git reset --hard origin/main
npm install --include=dev      # NODE_ENV=production retire les devDeps → toujours --include=dev
npm run build --workspace=server   # tsc émet le dist malgré des warnings de type pré-existants
```
Puis redémarrer le nœud cp (recharge env + dist).

## Base de données
- Se connecter depuis le nœud **sqldb** : `psql -U webadmin -h <IP_interne_sqldb> -d kido` (mot de passe via `~/.pgpass`).
- 127.0.0.1 = auth ident (échoue) → toujours l'IP interne. `-d postgres` pour les commandes admin.
- Migrations : drizzle-kit `push` casse en monorepo (hoisting) → générer le SQL ailleurs et l'appliquer via `psql -f`.

## IA (Luna)
- `server/src/services/ai.service.ts` : Infomaniak (`/1/ai/{PRODUCT}/openai/chat/completions`, modèles `mistral3`/`mistral24b`/`qwen3`) + fallback Anthropic.
- KPI : table `ai_usage` (tokens + est_cost_chf). Tarifs Infomaniak dans le service.

## Vérifs (depuis le nœud bl, contourne le MITM TLS du sandbox)
```
echo | openssl s_client -servername vivokid.ch -connect 127.0.0.1:443 | openssl x509 -noout -issuer
curl -sk https://127.0.0.1/health -H "Host: vivokid.ch"
```
