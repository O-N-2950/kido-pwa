# KIDO — Contexte Projet

> Mis à jour à chaque session Claude.

## État actuel : SCAFFOLD COMPLET — Phase MVP
- ✅ Monorepo TypeScript (shared + server + client)
- ✅ DB Schema complet (Drizzle — 12 tables)
- ✅ Backend Express + Socket.io
- ✅ Auth JWT avec révocation (token_version)
- ✅ Trust Score service
- ✅ Geofence service (Haversine)
- ✅ Routes: auth, family, location, child
- ⏳ Client React PWA — À CONSTRUIRE
- ⏳ Firebase FCM push notifications
- ⏳ Stripe billing (plan annual)
- ⏳ Tests

## Best practices extraites des repos NEO
- boom-contact: Drizzle, tRPC pattern, Socket.io rooms, Zod validation, JWT token_version, helmet, rate limiting, Dockerfile multi-stage
- umbra: magic link auth option, Alembic-style migrations, Sentry monitoring
- kombo-api: graceful degradation sans DB
- neo-watcher: health check pattern /health

## Décisions techniques
- TypeScript full-stack (pas Python) → boom-contact prouve que c'est fiable sur Railway
- Socket.io rooms par famille → isolation des données parfaite
- Drizzle ORM → type-safe, migrations SQL propres
- Facturation annuelle uniquement → Stripe 2.5% vs 11.4% mensuel

## Prochaine étape
Builder le client React PWA avec l'UX exceptionnel défini.
