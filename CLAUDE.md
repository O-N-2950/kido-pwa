# KIDO — Claude Instructions

> Lire CONTEXT.md avant toute action. Ne jamais casser une session famille active.

## Mission
Kido est la première app de sécurité familiale cross-platform (Android + iOS PWA)
qui récompense la confiance plutôt que de surveiller.
**Tagline : "Grandir ensemble."**

## Stack — Pattern Groupe NEO (boom-contact)
- Frontend  : React 18 + Vite + TypeScript + TailwindCSS
- Backend   : Node.js + TypeScript + Express + Socket.io
- DB        : PostgreSQL + Drizzle ORM (migrations dans /drizzle/)
- Auth      : JWT access (7j) + refresh (30j) + token_version (révocation)
- Realtime  : Socket.io — rooms `family:{id}` et `user:{id}`
- Push      : Firebase FCM
- Billing   : Stripe (annuel uniquement — cf. analyse Stripe fees)
- Deploy    : Railway (Docker)
- Monitoring: /health endpoint + neo-watcher

## Architecture rooms Socket.io
- `family:{familyId}` — parents + tous les enfants de la famille
- `user:{userId}`     — messages directs (SOS, négociation réponse)

## 6 Features Exclusives (NE PAS SUPPRIMER)
1. 🌡️ Mood Check-in — POST /api/child/mood
2. ⭐ Trust Score    — service trust.service.ts
3. ⏱️ Countdown      — POST /api/child/checkin (type: 'arriving')
4. 🤫 SOS Discret   — POST /api/child/sos
5. 🗺️ Trajet Smart  — geofence.service.ts + routes table
6. 👴 Cercle Élargi — table circle

## 4 Concepts Révolutionnaires
1. Le Pacte Familial — table pactes (signé par les deux parties)
2. L'Échelle d'Autonomie — trust_levels dans shared/types
3. Le Pouls Familial — POST /api/child/pulse (20h quotidien)
4. Moteur de Négociation — POST /api/child/negotiate

## Règles absolues
- Valider avec Zod AVANT tout traitement (pattern boom-contact)
- JWT token_version check sur CHAQUE requête protégée
- Ne jamais exposer passwordHash dans les réponses API
- Indexes DB sur tous les champs de requête fréquents
- Health check répond en < 200ms
- Rate limit: 200 req/15min global, 20 req/15min sur /auth

## Variables env requises
DATABASE_URL, JWT_SECRET, PORT
Optionnel: STRIPE_SECRET_KEY, FIREBASE_*, RESEND_API_KEY

## Deploy Railway
```bash
git push origin main  # auto-deploy via Railway
```
