# Discours de présentation — Microservice Rendez-vous

---

## 1. Rôle du microservice dans le projet

Mon microservice est le **cœur de coordination** du système.
Il est responsable de la gestion complète des rendez-vous médicaux.
Son rôle est central : il ne travaille pas seul — il orchestre les 4 autres microservices pour garantir qu'un rendez-vous ne peut être créé que si toutes les conditions sont réunies.
Il tourne sur le port **8083** avec une base de données **MariaDB** dédiée.

---

## 2. Base de données

Base : `rendezvous_db` — MariaDB, indépendante des autres services.

Table principale : `rendezvous`

| Champ | Type | Rôle |
|-------|------|------|
| id | BIGINT | Identifiant unique |
| patient_id | BIGINT | Référence au patient (pas de jointure directe) |
| medecin_id | BIGINT | Référence au médecin |
| creneau_id | BIGINT | Référence au créneau planning |
| date_heure_rendezvous | DATETIME | Date et heure du RDV |
| date_creation | DATETIME | Horodatage de création |
| statut | ENUM | EN_ATTENTE, CONFIRME, ANNULE, TERMINE |
| motif | VARCHAR | Raison de la consultation |
| notes | VARCHAR | Notes médicales |

Chaque microservice a sa propre base — aucun accès direct aux tables des autres.

---

## 3. Principaux endpoints

| Méthode | URL                                 | Description                |
| ------- | ----------------------------------- | -------------------------- |
| POST    | /api/rendezvous                     | Créer un rendez-vous       |
| GET     | /api/rendezvous                     | Lister tous les RDV        |
| GET     | /api/rendezvous/{id}                | Détail d'un RDV            |
| GET     | /api/rendezvous/patient/{id}        | RDV d'un patient           |
| GET     | /api/rendezvous/medecin/{id}        | RDV d'un médecin           |
| PUT     | /api/rendezvous/{id}/statut         | Changer le statut          |
| PUT     | /api/rendezvous/{id}/annuler        | Annuler un RDV             |
| PUT     | /api/rendezvous/{id}/notes          | Modifier les notes         |
| GET     | /api/rendezvous/compte/medecin/{id} | Nombre de RDV d'un médecin |

---

## 4. Fonctionnalités

- **Créer** un rendez-vous avec validation complète
- **Consulter** tous les RDV, par patient, ou par médecin
- **Modifier le statut** : EN_ATTENTE → CONFIRME → TERMINE ou ANNULE
- **Annuler** un RDV avec libération automatique du créneau
- **Ajouter des notes** médicales sur un RDV existant

---

## 5. Bonus par rapport aux exigences

La professeure a demandé les fonctionnalités de base. Voici ce que j'ai ajouté :

**a) Triple validation avant création**
Avant de sauvegarder un RDV, je vérifie en temps réel :
- que le patient existe dans le microservice Patients
- que le médecin existe dans le microservice Médecins
- que le créneau est disponible dans le microservice Planning

**b) Protection contre les doublons**
Un même créneau ne peut pas être réservé deux fois simultanément — même si deux requêtes arrivent en même temps.

**c) Gestion automatique du cycle de vie du créneau**
- Création → créneau bloqué automatiquement dans Planning
- Annulation ou passage à TERMINE → créneau libéré automatiquement

**d) Notifications sur tous les événements**
Chaque action envoie une notification structurée au microservice Notifications :
RDV_CREE, RDV_ANNULE, RDV_STATUT_CHANGE, RDV_NOTES_MODIFIEES

**e) Endpoint de comptage pour le score de charge**
`GET /compte/medecin/{id}` — utilisé par le microservice Médecins pour calculer si un médecin est surchargé (0-6 RDV = disponible, 7-14 = charge normale, 15+ = surcharge).

**f) Dégradation gracieuse**
Si un microservice est hors ligne, le service continue de fonctionner avec des logs d'avertissement au lieu de crasher.

**g) PingController**
`GET /api/ping?url=...` — permet de tester la connectivité vers n'importe quelle URL depuis le serveur.

---

## 6. Tests effectués

- **Création d'un RDV valide** → statut 201, créneau bloqué, notification envoyée ✅
- **Création avec patient inexistant** → rejeté avec message d'erreur ✅
- **Création avec créneau déjà réservé** → rejeté avec message d'erreur ✅
- **Annulation** → statut ANNULE, créneau libéré dans Planning ✅
- **Changement de statut vers TERMINE** → créneau libéré automatiquement ✅
- **Consultation par patient et par médecin** → résultats filtrés correctement ✅
- **Notifications** → vérifiées dans le microservice Notifications après chaque action ✅
- **Score de charge** → médecin avec 15 RDV affiche SURCHARGE dans l'interface ✅

---

## 7. Interaction avec les autres microservices

Mon microservice est le seul à appeler les autres — c'est lui qui coordonne.

```
                    ┌─────────────┐
                    │   Patients  │ ← vérifie existence patient
                    └─────────────┘
                           ↑
UI → Rendez-vous → ────────┤
                           ↓
                    ┌─────────────┐
                    │   Médecins  │ ← vérifie existence médecin
                    └─────────────┘    + reçoit le compte RDV
                           ↑
                    ────────┤
                           ↓
                    ┌─────────────┐
                    │   Planning  │ ← vérifie / bloque / libère créneau
                    └─────────────┘
                           ↑
                    ────────┤
                           ↓
                    ┌──────────────────┐
                    │  Notifications   │ ← reçoit tous les événements
                    └──────────────────┘
```

Toutes les communications passent par les **API REST** exposées par chaque service.
En cas d'indisponibilité d'un service, le rendez-vous est quand même traité avec un avertissement dans les logs.
