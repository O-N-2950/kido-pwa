# 🛡️ Kido — Family Safety PWA

> **La seule app de sécurité familiale qui récompense la confiance plutôt que de surveiller.**

[![Status](https://img.shields.io/badge/status-MVP%20en%20cours-amber)](https://github.com/O-N-2950/kido-pwa)
[![Platform](https://img.shields.io/badge/platform-iOS%20%2B%20Android%20PWA-blue)](https://github.com/O-N-2950/kido-pwa)
[![License](https://img.shields.io/badge/license-proprietary-red)](https://github.com/O-N-2950/kido-pwa)

---

## 🎯 Le problème

- **Google Family Link** → Android uniquement côté enfant
- **Apple Screen Time** → iOS uniquement, contournable facilement
- **Bark / Qustodio** → 99–120 CHF/an, complexes, axés surveillance

**Les familles mixtes Android/iPhone n'ont rien de simple, cross-platform et abordable.**

---

## 💡 La solution — Kido

Une **PWA installable** sur Android ET iPhone, sans app store.  
Positionnement : **lien de confiance familial**, pas un logiciel de surveillance.

---

## ✨ 6 Features Exclusives — absentes chez tous les concurrents

### 🌡️ 1. Mood Check-in
L'enfant partage son état émotionnel en 1 tap (😔😴😐😊🤩).  
Le parent voit **comment va l'enfant**, pas juste où il est.  
Si l'humeur baisse régulièrement le même jour → alerte douce au parent.

### ⭐ 2. Trust Score — Confiance Gamifiée
Chaque bon comportement rapporte des points. Plus le score monte → plus l'enfant gagne de liberté.  
Bark et Qustodio punissent. **Kido récompense.**

### ⏱️ 3. Countdown Retour
L'enfant envoie "je rentre dans 20 min" en 1 tap.  
Un timer live apparaît sur le dashboard parent. Si le timer expire → alerte automatique.

### 🤫 4. SOS Discret
Alerte silencieuse par 3 secousses ou bouton volume.  
Aucune notification visible sur l'écran de l'enfant.

### 🗺️ 5. Trajet Intelligent
Couloir de trajet appris automatiquement. Déviation > 200m → alerte immédiate.

### 👴 6. Cercle Élargi
Accès lecture seule pour grands-parents et proches de confiance.

---

## 💰 Modèle Business

| Plan | Prix | Features |
|------|------|----------|
| **Free** | 0 CHF | 1 enfant, GPS basique |
| **Family** | 29 CHF/an | 3 enfants, toutes les features |
| **Pro** | 59 CHF/an | Enfants illimités, Cercle Élargi |
| **B2B École** | 199–499 CHF/an | Multi-familles |

> Facturation annuelle → Stripe prend 2.5% au lieu de 11.4% en mensuel.

---

## 🏗️ Stack Technique

- **Frontend** : React + Vite (PWA)
- **Backend** : FastAPI (Python)
- **DB** : PostgreSQL
- **Realtime** : WebSocket
- **Notifications** : Firebase FCM
- **Hosting** : Railway
- **Billing** : Stripe (annuel)

---

## 📅 Roadmap MVP — 8 semaines

| Semaine | Étape |
|---------|-------|
| S1–2 | Backend FastAPI + PostgreSQL + Auth JWT |
| S3 | PWA Parent — carte, alertes, géofencing |
| S4 | PWA Enfant — GPS share, Mood, Countdown, SOS |
| S5 | Trust Score engine + historique |
| S6 | Push notifications FCM (iOS + Android) |
| S7 | Stripe billing annuel + landing page |
| S8 | Beta 10 familles → itération |

---

## ⚖️ Comparatif concurrence

| Feature | Family Link | Screen Time | Bark | Qustodio | **Kido** |
|---------|-------------|-------------|------|----------|----------|
| Cross-platform | ❌ | ❌ | ✅ | ✅ | ✅ |
| Mood Check-in | ❌ | ❌ | ❌ | ❌ | **✅** |
| Trust Score | ❌ | ❌ | ❌ | ❌ | **✅** |
| Countdown Retour | ❌ | ❌ | ❌ | ❌ | **✅** |
| SOS Discret | ❌ | ❌ | ❌ | ❌ | **✅** |
| Trajet Intelligent | ❌ | ❌ | ❌ | ❌ | **✅** |
| Cercle Élargi | ❌ | ❌ | ❌ | ❌ | **✅** |
| Prix | Gratuit | Gratuit | 99$/an | 55$/an | **29 CHF/an** |

---

## 📁 Structure

```
kido-pwa/
├── src/
│   └── demo/
│       ├── kido-v1.jsx     # Prototype initial
│       └── kido-v2.jsx     # Demo V2 — 6 features exclusives ★
└── README.md
```

---

## 🔗 Synergie Groupe NEO

Distribution via **PEP's** et **WIN WIN Finance** — coût d'acquisition quasi nul.

---

*Kido — Groupe NEO © 2025. Tous droits réservés.*
