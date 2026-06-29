# 🟢 ÉTAT PRODUCTION — vivokid.ch (MAJ 29 juin 2026)

**vivokid.ch est EN LIGNE** — Infomaniak Jelastic, env `vivokid-prod`.

## Infra
- Topologie : Node 22 (cp) + Nginx LB (bl) + PostgreSQL 16 (sqldb), région `user2_hn_group`.
- HTTPS : certificat **Let's Encrypt** (CN=vivokid.ch + www), addon LE sur le LB (renouv. auto).
- DNS : A apex+www → IP partagées de l'env ; e-mail (SPF/DKIM/DMARC/MX) déjà posé par Infomaniak.
- Base `kido` : 15 tables (14 métier + `ai_usage`).
- PWA servi par le serveur Express (static + fallback SPA) → voir `server/src/index.ts`.
- DB : **SSL off sur réseau privé Jelastic** (`DB_SSL` configurable, off par défaut) → `server/src/db/index.ts`.

## 🤖 Luna — IA souveraine + KPI coûts
- Luna n'appelle plus Anthropic en direct. Service `server/src/services/ai.service.ts` :
  - Priorité **IA Infomaniak** (AI Tools, produit 109625, modèle `mistral3`, hébergé 🇨🇭) ; **fallback Anthropic** (Claude Haiku) si indispo.
  - Chaque appel loggé dans **`ai_usage`** (provider, model, tokens in/out, total, **est_cost_chf**, feature, date).
- Tarifs intégrés (CHF/1M tokens) : mistral3 0.30 in / 0.40 out → un résumé Luna ≈ **0.00006 CHF**.
- Secrets uniquement en **variables d'env Jelastic** (jamais dans le repo) : INFOMANIAK_AI_PRODUCT_ID, INFOMANIAK_AI_MODEL, INFOMANIAK_AI_TOKEN, ANTHROPIC_API_KEY (fallback), DATABASE_URL, JWT_SECRET, SMTP_*.

## Prochaines étapes possibles
- Endpoint + tableau de bord KPI (agrégation `ai_usage` par jour / feature / coût).
- Redirection http→https sur le LB (canonical SEO).
- Brancher d'autres features sur `aiComplete()` au besoin.

---

# VIVOKID — Contexte Projet
> Mis à jour : Session 4 — Domaine vivokid.ch acheté, identité VIVOkid confirmée

## 🏷️ IDENTITÉ OFFICIELLE
- **Nom** : VIVOkid
- **Domaine** : vivokid.ch (acheté sur Infomaniak)
- **Email** : contact@vivokid.ch (SMTP Infomaniak, configuré)
- **Entité** : PEP's Swiss SA, Jura, Suisse 🇨🇭
- **Tagline** : "La famille, connectée avec confiance"
- **Ancien nom** : Kido (nom de travail, abandonné — kido.ch était pris)

## 📧 SMTP Infomaniak (NE PAS committer en clair)
- Host : mail.infomaniak.com:465 (SSL)
- User : contact@vivokid.ch
- Pass : → dans /mnt/project/mot_de_passe_e-mail_infomaniak_contact_vivokid.ch
- Quota : 200 emails/24h (comme peps-v2-pwa — Resend en fallback)

## 🏗️ Infrastructure (Infomaniak + Railway)
- Railway token : → /mnt/project/Token_Railway
- Infomaniak token : → /mnt/project/Token_infomaniak
- OpenStack Infomaniak : Cristal4you11++
- Jelastic full access : c1aca6923e824434b37a808a5f67f788542cee62
- Hébergement cible : Infomaniak Jelastic CH (nLPD — comme swissrh, umbra)

## ✅ État actuel : BACKEND COMPLET — CLIENT PWA À CONSTRUIRE

### Livré
- Monorepo TypeScript (shared + server)
- DB Schema 12 tables Drizzle + PostgreSQL
- Backend Express + Socket.io + JWT révocable (token_version)
- Auth : register parent, login, add-child (PIN 6 chiffres)
- Routes : family dashboard, GPS location, child actions
- Trust Score engine (applyTrustAction, 10 actions définies)
- Geofence Haversine service (enter/exit detection)
- 🤖 Luna — Agent gardien IA (pattern winwin-v2 agents)
- 🎙️ VoiceCheck — Deepgram STT + Claude Haiku parse ETA
- 🔍 Crash Monitor — heartbeat 5min, alerte dégradation (pattern swissrh)
- 📧 Email service — SMTP Infomaniak + Resend fallback + 3 templates (welcome, SOS, Luna)
- 🚀 Railway-ready (Dockerfile multi-stage, railway.toml, /health)

### ⏳ À construire
- Client React PWA (Vite + TailwindCSS + Framer Motion)
- Interface Parent : dashboard, carte GPS, alertes, négociations
- Interface Enfant : mood, countdown, SOS discret, check-ins vocaux
- Interface Luna : rapport quotidien, historique patterns
- Capacitor iOS/Android (GPS background)
- Stripe billing annuel (29/59 CHF)
- Firebase FCM push notifications
- Tests Vitest

## 🎯 6 Features Exclusives
1. 🌡️ Mood Check-in → POST /api/child/mood
2. ⭐ Trust Score → server/src/services/trust.service.ts
3. ⏱️ Countdown Retour → POST /api/child/checkin (type: 'arriving')
4. 🤫 SOS Discret → POST /api/child/sos
5. 🗺️ Trajet Intelligent → geofence.service.ts + routes table
6. 👴 Cercle Élargi → table circle

## 🚀 4 Concepts Révolutionnaires
1. Le Pacte Familial → table pactes
2. L'Échelle d'Autonomie → TRUST_LEVELS dans shared/types
3. Le Pouls Familial → POST /api/child/pulse (21h quotidien)
4. Moteur de Négociation → POST /api/child/negotiate

## 📋 Best Practices — 58 repos NEO analysés
| Repo | Pattern extrait |
|------|----------------|
| winwin-v2 | Multi-agents IA, crash monitor, tRPC |
| winwin-voice-agent | Deepgram STT + Anthropic + Cartesia TTS |
| peps-v2-pwa | Capacitor, Framer Motion, SMTP quota alert, WebAuthn |
| swissrh | SSO cross-app, crash monitor, Jelastic CH |
| boom-contact | Drizzle, Socket.io, Zod, helmet, rate-limit, Dockerfile |
| soluris | pgvector behavioral memory |
| moneasy | HMAC cross-app, magic link |
| wolf-saas | Magic token, pgEnum |
| tournepage | PII Swiss architecture |
| neo-synergy-hub | Manifeste inter-apps |
