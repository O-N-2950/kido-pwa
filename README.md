# 🛡️ Kido — Family Safety PWA

> **La seule app de sécurité familiale cross-platform qui mise sur la confiance, pas la surveillance.**

![Version](https://img.shields.io/badge/version-2.0.0-teal) ![PWA](https://img.shields.io/badge/PWA-cross--platform-blue) ![Année](https://img.shields.io/badge/année-2026-amber) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Positionnement

| | Google Family Link | Apple Screen Time | **Kido** |
|---|---|---|---|
| Cross-platform (Android + iOS) | ❌ Enfant Android only | ❌ iOS only | ✅ |
| Gratuit | ✅ | ✅ | Freemium |
| GPS temps réel | ✅ basique | ❌ | ✅ avancé |
| Mood Check-in émotionnel | ❌ | ❌ | ✅ **Exclusif** |
| Trust Score / autonomie gamifiée | ❌ | ❌ | ✅ **Exclusif** |
| Countdown retour temps réel | ❌ | ❌ | ✅ **Exclusif** |
| SOS Discret (silencieux) | ❌ | ❌ | ✅ **Exclusif** |
| Trajet Intelligent (IA) | ❌ | ❌ | ✅ **Exclusif** |
| Cercle Élargi (grands-parents) | ❌ | ❌ | ✅ **Exclusif** |

---

## ✨ 6 Features Exclusives

### 🌡️ Mood Check-in
L'enfant partage son état émotionnel en 1 tap (😔😴😐😊🤩). Le parent voit l'humeur sur la carte, pas juste un point GPS. Si l'humeur baisse régulièrement le même jour → alerte douce.

### ⭐ Trust Score
Système de confiance gamifié. Chaque bon comportement rapporte des points. Plus le score monte → moins la surveillance est intrusive. L'enfant gagne sa liberté.

### ⏱️ Countdown Retour
L'enfant envoie "je rentre dans 20 min". Un timer live apparaît chez le parent. Si expiré sans arrivée → alerte automatique.

### 🤫 SOS Discret
3 secousses du téléphone ou bouton volume → alerte silencieuse GPS aux parents. Aucune notification visible sur l'écran de l'enfant.

### 🗺️ Trajet Intelligent
Après 5 trajets identiques, Kido crée un couloir de trajet. Déviation > 200m → alerte immédiate. Accélération soudaine (véhicule ?) → alerte prioritaire.

### 👴 Cercle Élargi
Accès lecture seule pour les proches de confiance. Mamie voit la position de Zoé sans avoir les contrôles parentaux. Révocable en 1 clic.

---

## 💰 Modèle tarifaire (CHF)

| Plan | Prix | Stripe net |
|---|---|---|
| Free | 0 | — |
| Essentiel | 29 CHF/an | 28.26 CHF |
| Famille | 59 CHF/an | 57.52 CHF |
| B2B Écoles | 199–499 CHF/an | négocié |

> Facturation annuelle uniquement — réduit la commission Stripe de 11.4% → 2.5%

---

## 🏗️ Stack Technique

```
Frontend  → React + Vite (PWA)
Backend   → FastAPI (Python)
DB        → PostgreSQL
Realtime  → Socket.IO (GPS toutes les 30s)
Push      → Firebase FCM (Android + iOS)
Hosting   → Railway
Payments  → Stripe (annuel)
```

---

## 📅 Roadmap 2026

- [x] Démo interactive V2 (React)
- [ ] Backend FastAPI + Auth JWT familles
- [ ] PWA Parent — carte, alertes, géofencing
- [ ] PWA Enfant — GPS share, mood, SOS discret
- [ ] Push notifications FCM iOS + Android
- [ ] Stripe billing annuel
- [ ] Beta 10 familles
- [ ] Launch public

---

## 🔗 Synergie Groupe NEO

Distribution via **PEP's** (marchands locaux → familles) · Bundle **WIN WIN** assurance famille · Canaux existants = coût acquisition quasi nul.

---

*Kido — Pas un logiciel de surveillance. Un lien de confiance.*
