# 🛡️ VIVOkid — Family Safety PWA

> **La famille, connectée avec confiance.**  
> La première app de sécurité familiale cross-platform qui récompense la confiance plutôt que de surveiller.

[![Domain](https://img.shields.io/badge/domain-vivokid.ch-teal)](https://vivokid.ch)
[![Platform](https://img.shields.io/badge/platform-iOS%20%2B%20Android%20PWA-blue)](https://vivokid.ch)
[![Status](https://img.shields.io/badge/status-MVP%20backend%20livré-amber)](https://github.com/O-N-2950/kido-pwa)
[![Made in Switzerland](https://img.shields.io/badge/made%20in-🇨🇭%20Jura%20Switzerland-red)](https://vivokid.ch)

---

## 🎯 Le problème

- **Google Family Link** → Android uniquement côté enfant
- **Apple Screen Time** → iOS uniquement, contournable facilement
- **Bark / Qustodio** → 99–120 CHF/an, complexes, axés surveillance

**Les familles mixtes Android/iPhone n'ont rien de simple, cross-platform, abordable — et qui respecte l'enfant.**

---

## 💡 VIVOkid — la différence

VIVOkid n'est pas une app de surveillance. C'est le premier **protocole de confiance familiale**.

*VIVO* = vie, vivant (universel FR/DE/IT/EN)  
*Kid* = enfant (universel)  
→ La vie de famille, pleinement vécue.

---

## ✨ 6 Features Exclusives — absentes chez tous les concurrents

| Feature | Qu'est-ce que c'est | Concurrents |
|---------|---------------------|-------------|
| 🌡️ **Mood Check-in** | L'enfant partage son humeur en 1 tap. Parent voit l'état émotionnel, pas juste la position GPS. | ❌ Aucun |
| ⭐ **Trust Score** | Gamification positive : bons comportements → points → plus de liberté. L'enfant est acteur. | ❌ Aucun |
| ⏱️ **Countdown Retour** | "Je rentre dans 20 min" → timer live côté parent. Expire = alerte automatique. | ❌ Aucun |
| 🤫 **SOS Discret** | 3 secousses ou bouton volume → alerte silencieuse aux parents. Rien n'apparaît à l'écran. | ❌ Aucun |
| 🗺️ **Trajet Intelligent** | Apprend le trajet habituel. Déviation > 200m = alerte. Vitesse véhicule = alerte prioritaire. | ❌ Aucun |
| 👴 **Cercle Élargi** | Grands-parents et proches en lecture seule. Révocable en 1 clic. | ❌ Aucun |

---

## 🤖 Luna — L'Agent Gardien IA

Inspiré du système multi-agents de WIN WIN Finance (Tina, Sophie, Emma...).  
Luna observe les patterns comportementaux chaque soir et **propose** — sans jamais décider :

- *"Emma est systématiquement moins heureuse le lundi depuis 3 semaines"*
- *"Noah n'a plus envoyé de check-in depuis 4 jours"*
- *"Le score de confiance de Zoé baisse cette semaine"*

---

## 🎙️ VoiceCheck — Check-in vocal

L'enfant dit simplement : *"Je rentre, j'arrive dans 20 minutes"*  
→ Deepgram transcrit, Claude Haiku extrait l'ETA, le countdown démarre.  
Zéro tap. Zéro friction.

---

## 💰 Modèle Business

| Plan | Prix | Features |
|------|------|----------|
| **Free** | 0 CHF | 1 enfant, GPS basique |
| **Family** | 29 CHF/an | 3 enfants + toutes les features |
| **Pro** | 59 CHF/an | Enfants illimités + Cercle Élargi |
| **B2B École** | 199–499 CHF/an | Dashboard multi-familles |

> Facturation annuelle → Stripe 2.5% au lieu de 11.4% en mensuel.

---

## 🏗️ Architecture — NEO Best Practices (58 repos analysés)

```
VIVOkid Stack

Frontend  → React 18 + Vite + TypeScript + TailwindCSS + Framer Motion
Mobile    → Capacitor iOS/Android (GPS background natif)
Backend   → Express + TypeScript + Socket.io (rooms family:{id})
DB        → PostgreSQL + Drizzle ORM (12 tables)
Auth      → JWT + token_version révocable + Magic Link
AI        → Anthropic SDK (Luna + VoiceCheck)
Voice     → Deepgram STT
Email     → SMTP Infomaniak (contact@vivokid.ch) + Resend fallback
Push      → Firebase FCM
Billing   → Stripe annual
Hosting   → Infomaniak Jelastic CH (souveraineté nLPD)
Monitor   → /health + Crash Monitor + neo-watcher
```

---

## 📁 Structure

```
vivokid/
├── shared/                 ← Types + Zod schemas (FR/DE/IT/EN)
│   ├── types/index.ts      ← MOOD_MAP, TRUST_LEVELS, TRUST_ACTIONS
│   └── schemas/index.ts    ← 9 schémas Zod validés
├── server/                 ← Backend TypeScript
│   └── src/
│       ├── agents/luna.ts  ← 🤖 Agent gardien IA
│       ├── db/schema.ts    ← 12 tables PostgreSQL
│       ├── middleware/auth.ts ← JWT + révocation token_version
│       ├── monitoring/     ← Crash Monitor (pattern swissrh)
│       ├── routes/         ← auth, family, location, child, voice
│       └── services/       ← trust, geofence, email (SMTP), voice
├── src/demo/
│   └── kido-v2.jsx         ← Démo interactive (6 features)
├── CLAUDE.md               ← Instructions Claude
├── CONTEXT.md              ← État projet (mis à jour chaque session)
├── Dockerfile              ← Multi-stage, Railway-ready
└── railway.toml            ← Health check + restart policy
```

---

## ⚖️ Comparatif

| Feature | Family Link | Screen Time | Bark | Qustodio | **VIVOkid** |
|---------|:-----------:|:-----------:|:----:|:--------:|:-----------:|
| Cross-platform | ❌ | ❌ | ✅ | ✅ | ✅ |
| Mood Check-in | ❌ | ❌ | ❌ | ❌ | **✅** |
| Trust Score | ❌ | ❌ | ❌ | ❌ | **✅** |
| Countdown Retour | ❌ | ❌ | ❌ | ❌ | **✅** |
| SOS Discret | ❌ | ❌ | ❌ | ❌ | **✅** |
| Trajet Intelligent | ❌ | ❌ | ❌ | ❌ | **✅** |
| Cercle Élargi | ❌ | ❌ | ❌ | ❌ | **✅** |
| Agent IA (Luna) | ❌ | ❌ | ❌ | ❌ | **✅** |
| Voice Check-in | ❌ | ❌ | ❌ | ❌ | **✅** |
| Swiss hosting nLPD | ❌ | ❌ | ❌ | ❌ | **✅** |
| Prix | Gratuit | Gratuit | 99$/an | 55$/an | **29 CHF/an** |

---

## 🔗 Synergie Groupe NEO

- **PEP's** — réseau commerçants → SafeNetwork zones de confiance
- **WIN WIN Finance** — bundle assurance famille
- **SwissRH** — SSO cross-app (pattern swissrh)
- **MonEasy** — HMAC cross-app (pattern moneasy)

---

*VIVOkid — vivokid.ch · contact@vivokid.ch*  
*PEP's Swiss SA · Jura, Suisse 🇨🇭*
