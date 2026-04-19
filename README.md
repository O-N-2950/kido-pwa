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

## 💡 La solution Kido

Une **PWA installable en 10 secondes** sur Android ET iPhone.  
Positionnement : **lien de confiance familial**, pas logiciel de surveillance.

---

## ✨ 6 Features Exclusives — Inexistantes chez les concurrents

### 🌡️ 1. Mood Check-in
L'enfant partage son état émotionnel en 1 tap (😔😴😐😊🤩).  
Le parent voit l'humeur sur la carte, pas juste un point GPS.  
Si l'humeur baisse régulièrement → alerte douce au parent.

### ⭐ 2. Trust Score (Confiance Gamifiée)
Chaque bon comportement rapporte des points :
- Rentré à l'heure → +5 pts
- Check-in envoyé → +3 pts
- Trajet suivi → +4 pts
- Hors zone → -8 pts

Plus le score monte, **moins la surveillance est intrusive**.  
L'enfant est acteur de sa propre liberté.

### ⏱️ 3. Countdown Retour
L'enfant envoie "20 min" en 1 tap → timer live côté parent.  
Si le timer expire sans arrivée → **alerte automatique**.

### 🤫 4. SOS Discret
Agiter le téléphone 3× ou appuyer sur le bouton volume → alerte silencieuse envoyée aux parents avec GPS.  
**Aucune notification visible sur l'écran de l'enfant.**  
Pour les situations où l'enfant ne peut pas montrer qu'il envoie une alerte.

### 🗺️ 5. Trajet Intelligent
Après 5 trajets identiques, Kido crée un "couloir de trajet".  
Déviation > 200m → **alerte immédiate**.  
Accélération soudaine (véhicule ?) → alerte prioritaire.

### 👴 6. Cercle Élargi
Accès lecture seule pour les proches de confiance (grands-parents, oncles...).  
Notification automatique quand l'enfant arrive dans une zone clé.  
Révocable en 1 clic par le parent.

---

## 🏗️ Architecture Technique

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   PWA Parent    │────▶│  FastAPI Backend  │────▶│   PostgreSQL    │
│  React + Vite   │     │  WebSocket Live   │     │   (Railway)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
             ┌──────▼──────┐        ┌───────▼──────┐
             │  PWA Enfant  │        │  Firebase FCM │
             │ React + Vite │        │  Push Android │
             └─────────────┘        │    + iOS      │
                                    └──────────────┘
```

| Couche | Tech | Note |
|--------|------|------|
| Frontend | React + Vite | Une codebase, deux interfaces (parent/enfant) |
| Backend | FastAPI (Python) | REST + WebSocket temps réel |
| Base de données | PostgreSQL | Hébergé Railway |
| Realtime | Socket.IO | GPS toutes les 30s |
| Push | Firebase FCM | Android + iOS via PWA |
| Hosting | Railway | Stack Groupe NEO |
| Paiement | Stripe | Facturation annuelle uniquement |

---

## 💰 Modèle Business

| Plan | Prix | Stripe net | Cible |
|------|------|-----------|-------|
| **Free** | 0 CHF | — | 1 enfant, GPS basique |
| **Starter** | 29 CHF/an | ~28.26 CHF | 2 enfants, géofencing |
| **Family** | 59 CHF/an | ~57.75 CHF | 5 enfants, toutes features |
| **B2B École** | 199–499 CHF/an | custom | Centres aérés, écoles |

> ⚡ **Facturation annuelle uniquement** — réduit la commission Stripe de 11.4% → 2.5%

---

## 📅 Roadmap MVP — 6 Semaines

| Sprint | Objectif |
|--------|----------|
| **S1–S2** | Backend FastAPI + PostgreSQL + Auth JWT familles |
| **S3** | PWA Parent — carte, alertes, géofencing, Trust Score |
| **S4** | PWA Enfant — GPS, Mood Check-in, Countdown, SOS Discret |
| **S5** | Push FCM, Trajet Intelligent, Cercle Élargi, tests iOS/Android |
| **S6** | Stripe billing annuel, landing page, beta 10 familles |

---

## 🎯 Marché Cible

- 🇨🇭 **Suisse** — 500k+ familles 8–14 ans (lancement)
- 🇫🇷 **France** — marché 10× plus grand (phase 2)
- 🇧🇪 **Belgique** — francophone (phase 2)
- **Synergie Groupe NEO** — distribution via PEP's + bundle WIN WIN assurance famille

---

## 🚀 Lancer la démo

```bash
# Cloner le repo
git clone https://github.com/O-N-2950/kido-pwa.git
cd kido-pwa

# Installer les dépendances
npm install

# Lancer en dev
npm run dev
```

---

## 📁 Structure du projet

```
kido-pwa/
├── src/
│   ├── demo/
│   │   └── kido-v2.jsx          # Démo interactive complète (React)
│   ├── parent/                  # Interface parent (à venir)
│   ├── child/                   # Interface enfant (à venir)
│   └── backend/                 # FastAPI (à venir)
├── public/
│   └── manifest.json            # PWA manifest
└── README.md
```

---

## 📄 Licence

Projet propriétaire — Groupe NEO © 2025  
Tous droits réservés.
