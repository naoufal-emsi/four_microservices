# Rendezvous Service — API Endpoints

- **Host**: `http://192.168.1.35:8083`
- **Content-Type**: `application/json`

---

## Model

```json
{
  "id": 1,
  "patientId": 1,
  "medecinId": 2,
  "creneauId": 5,
  "dateHeureRendezvous": "2025-06-10T09:00:00",
  "dateCreation": "2025-06-01T08:00:00",
  "statut": "EN_ATTENTE",
  "motif": "string (optional)",
  "notes": "string (optional)"
}
```

**statut** values: `EN_ATTENTE` · `CONFIRME` · `ANNULE` · `TERMINE`

> On creation, `dateCreation` and `statut` are set automatically by the server — no need to send them.

---

## Endpoints

### POST `/api/rendezvous`
Create a new rendezvous. Validates patient, médecin, and créneau availability across microservices.

**Body:**
```json
{
  "patientId": 1,
  "medecinId": 2,
  "creneauId": 5,
  "dateHeureRendezvous": "2025-06-10T09:00:00",
  "motif": "Consultation générale"
}
```

**201** → Rendezvous object  
**400** → `"Patient introuvable: 1"` / `"Créneau indisponible ou introuvable: 5"` / `"Ce créneau est déjà réservé"`

---

### GET `/api/rendezvous`
Get all rendezvous.

**200** → `[ Rendezvous, ... ]`

---

### GET `/api/rendezvous/{id}`
Get one rendezvous by ID.

**200** → Rendezvous object  
**404** → not found

---

### GET `/api/rendezvous/patient/{patientId}`
Get all rendezvous for a patient.

**200** → `[ Rendezvous, ... ]`

---

### GET `/api/rendezvous/medecin/{medecinId}`
Get all rendezvous for a médecin.

**200** → `[ Rendezvous, ... ]`

---

### PUT `/api/rendezvous/{id}/statut`
Change the statut of a rendezvous. Automatically frees the créneau if set to `ANNULE` or `TERMINE`.

**Body:**
```json
{ "statut": "CONFIRME" }
```

**200** → Updated Rendezvous  
**400** → error message

---

### PUT `/api/rendezvous/{id}/annuler`
Cancel a rendezvous. Frees the créneau and sends a notification.

**200** → Updated Rendezvous (statut = `ANNULE`)  
**400** → `"Ce rendez-vous est déjà annulé"`

---

### PUT `/api/rendezvous/{id}/notes`
Update the notes of a rendezvous.

**Body:**
```json
{ "notes": "Patient a confirmé par téléphone." }
```

**200** → Updated Rendezvous  
**400** → error message

---

### GET `/api/ping?url={targetUrl}`
Check reachability and latency of any URL.

**200:**
```json
{ "status": "ok", "latency": 42, "url": "http://..." }
{ "status": "error", "latency": 120, "url": "http://...", "error": "Connection refused" }
```

---

## JS Integration

```js
const BASE = 'http://192.168.1.35:8083/api/rendezvous';

const getAll = () =>
  fetch(BASE).then(r => r.json());

const getById = (id) =>
  fetch(`${BASE}/${id}`).then(r => r.json());

const getByPatient = (patientId) =>
  fetch(`${BASE}/patient/${patientId}`).then(r => r.json());

const getByMedecin = (medecinId) =>
  fetch(`${BASE}/medecin/${medecinId}`).then(r => r.json());

const create = (rdv) =>
  fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rdv),
  }).then(r => r.ok ? r.json() : r.text().then(e => { throw new Error(e) }));

const changeStatut = (id, statut) =>
  fetch(`${BASE}/${id}/statut`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut }),
  }).then(r => r.json());

const annuler = (id) =>
  fetch(`${BASE}/${id}/annuler`, { method: 'PUT' }).then(r => r.json());

const modifierNotes = (id, notes) =>
  fetch(`${BASE}/${id}/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  }).then(r => r.json());
```
