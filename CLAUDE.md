# VIVOKID — Claude Instructions
> Lire CONTEXT.md avant toute action. Le nom officiel est VIVOkid (pas Kido).

## Règle absolue
- Ne jamais committer les mots de passe en clair dans le code
- Toujours vérifier Railway logs après deploy
- Le brand est VIVOkid, domaine vivokid.ch, email contact@vivokid.ch

## Stack
- Frontend : React 18 + Vite + TypeScript + TailwindCSS + Framer Motion
- Backend : Node.js + TypeScript + Express + Socket.io
- DB : PostgreSQL + Drizzle ORM
- Auth : JWT + token_version (révocation) + Magic Link + WebAuthn (futur)
- AI : Anthropic SDK (Luna agent + VoiceCheck parse)
- Voice : Deepgram STT (transcription check-ins vocaux)
- Push : Firebase FCM
- Email : SMTP Infomaniak (contact@vivokid.ch) + Resend fallback
- Billing : Stripe annual (29 CHF Family / 59 CHF Pro)
- Deploy : Railway → Infomaniak Jelastic CH (nLPD)
- Monitor : /health + crash-monitor + neo-watcher

## Environnements
- Dev : localhost:3000 (backend) + localhost:5173 (frontend)
- Prod : vivokid.ch (Infomaniak Jelastic ou Railway)

## Commandes fréquentes
- `npm run dev` — lance backend + frontend en parallèle
- `npm run db:push` — push schema Drizzle vers DB
- `npm run typecheck` — vérifie types TypeScript

## Credentials (NE PAS modifier — lire depuis /mnt/project/)
- SMTP : contact@vivokid.ch / voir project file
- Railway token : voir project file
- Infomaniak token : voir project file
