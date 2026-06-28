# KIDO — Contexte Projet
> Mis à jour : Session 3 — Analyse complète 58 repos

## État : SCAFFOLD V2 COMPLET + LUNA + VOICE

### ✅ Livré
- Monorepo TypeScript (shared + server)
- DB Schema complet 12 tables (Drizzle + PostgreSQL)
- Backend Express + Socket.io + JWT révocable
- Auth: register, login, add-child (PIN 6 chiffres)
- Routes: family dashboard, GPS location, child actions
- Trust Score engine (applyTrustAction)
- Geofence Haversine service
- 🆕 Luna — Agent gardien IA (pattern winwin-v2 agents)
- 🆕 VoiceCheck-in (Deepgram + Claude Haiku)
- 🆕 Crash Monitor (pattern swissrh)
- 🆕 Capacitor targets (iOS/Android background GPS)

### ⏳ Prochaine étape : CLIENT React PWA

## Best Practices extraites — 58 repos analysés

| Repo | Pattern extrait | Utilisé dans Kido |
|------|----------------|-------------------|
| boom-contact | Drizzle ORM, Socket.io, JWT token_version, helmet, rate-limit, Dockerfile multi-stage | ✅ Tout |
| winwin-v2 | Multi-agent system (Tina/Sophie/etc.), LLM router, crash monitor | ✅ Luna agent |
| winwin-voice-agent | Deepgram STT + Anthropic + Cartesia TTS pipeline | ✅ VoiceCheck |
| planneo | useVoiceAgent hook React, VAD, audio queue | 🔜 Client |
| peps-v2-pwa | Capacitor iOS/Android, Face ID, Framer Motion | 🔜 Client |
| swissrh | SSO cross-app JWT, Crash Monitor, Infomaniak Jelastic | ✅ Monitor + 🔜 PEP's SSO |
| umbra/merito | Swiss hosting nLPD, AES-256, Magic link | ✅ Architecture |
| soluris | pgvector + Cohere embeddings comportementaux | 🔜 Luna v2 |
| moneasy | HMAC cross-app, Magic link, WebAuthn | 🔜 Auth v2 |
| wolf-saas | Magic token, pgEnum, Drizzle pattern | ✅ Schema |
| tournepage | PII architecture, S3 Infomaniak, docx | 🔜 Export |
| devispro | Claude Vision OCR, S3 | 🔜 Feature |
| neo-synergy-hub | Manifeste inter-apps | 🔜 Distribution |

## Idées révolutionnaires validées (niveau suivant)
1. 🤖 Luna — IA guardian, pattern multi-agents winwin-v2
2. 🎙️ VoiceCheck — "Je rentre dans 20 min" → AI parse
3. 📱 Capacitor — GPS background natif iOS/Android
4. 🔗 PEP's SafeNetwork — commerçants = zones sécurisées
5. 🧠 Behavioral Memory — pgvector + profil comportemental
6. 🇨🇭 Swiss-by-Design — Infomaniak Jelastic nLPD
7. 🎭 Face ID Auth — WebAuthn pour parents (pattern moneasy)

## Variables env requises
DATABASE_URL, JWT_SECRET, PORT
ANTHROPIC_API_KEY (Luna + VoiceCheck)
DEEPGRAM_API_KEY (transcription vocale)
FIREBASE_* (push FCM)
STRIPE_SECRET_KEY (billing annuel)
RESEND_API_KEY (emails)
