# CoreHubFocus

> Plateforme interne de gestion du cycle de vie des applications mobiles.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## 📖 Description

CoreHubFocus centralise le cycle de vie de vos applications mobiles,
de la conception (specs) à l'analyse de performance (KPIs).
L'interface sobre et sombre (Vercel-like) permet une lecture
confortable des données techniques au quotidien.

---

## ✨ Fonctionnalités

### 🗂️ Gestion du parc applicatif
- Ajouter, modifier et supprimer des applications
- Informations : nom, version, icône, description, stack technique
- Suppression sécurisée avec double confirmation

### 📊 Dashboard modulaire
- Compteur global : applications actives vs archivées
- Santé documentaire : % d'apps avec documentation complète
- Timeline des builds : derniers ajouts et mises à jour
- Répartition OS : ratio iOS vs Android
- Status Monitor : indicateur visuel (Vert / Orange / Rouge)

### 📁 Coffre-fort documentaire
- Dépôt de specs techniques (PDF / Markdown / lien Wiki)
- Dépôt de specs graphiques (Figma / Adobe XD / captures)
- Consultation et mise à jour par application

### 🔍 Fiche détail par application
- Accès au code source ou lien de test (TestFlight / PlayConsole)
- Logs de modifications (qui a changé quoi et quand)

---

## 🛠️ Stack technique

| Composant         | Technologie                          |
|-------------------|--------------------------------------|
| Frontend          | Next.js 16 (App Router) + TypeScript |
| Styles            | Tailwind CSS + Design system sombre  |
| Base de données   | Supabase (PostgreSQL + Auth)         |
| Stockage fichiers | Supabase Storage                     |
| Icônes            | Lucide React                         |

---

## 🎨 Design System

- **Fond principal** : `#000000`
- **Surface modules** : `#111111`
- **Accent primaire** : `#FFFFFF`
- **Accent action** : `#0070F3` (Bleu Vercel)
- **Danger** : `#FF0000`
- **Bordures** : `#333333`
- **Typographie** : Geist Sans / Inter / Geist Mono

---

## 🗄️ Base de données (Supabase)

Tables principales :
- `mobile_apps` — Inventaire des applications
- `app_documents` — Documents et specs associés