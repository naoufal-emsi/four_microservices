# Rendezvous Service API Documentation

## Base Configuration
- **Base URL**: `http://192.168.1.35:8083`
- **Service Name**: rendezvous-service
- **Port**: 8083
- **Content-Type**: `application/json`

## Data Model

### Rendezvous
```json
{
  "id": "number (auto-generated)",
  "patientId": "number (required)",
  "medecinId": "number (required)",
  "creneauId": "number (required)",
  "dateHeureRendezvous": "string (ISO 8601, required) — e.g. 2025-06-10T09:00:00",
  "dateCreation": "string (ISO 8601, required)",
  "statut": "EN_ATTENTE | CONFIRME | ANNULE | TERMINE (required)",
  "motif": "string (optional, max 500)",
  "notes": "string (optional, max 500)"
}
```

---

## Endpoints

### 1. Create Rendezvous
`POST /api/rendezvous`

**Request Body**:
```json
{
  "patientId": 1,
  "medecinId": 2,
  "creneauId": 5,
  "dateHeureRendezvous": "2025-06-10T09:00:00",
  "dateCreation": "2025-06-01T08:00:00",
  "statut": "EN_ATTENTE",
  "motif": "Consultation générale"
}
```

**Response** `201 Created`:
```json
{
  "id": 1,
  "patientId": 1,
  "medecinId": 2,
  "creneauId": 5,
  "dateHeureRendezvous": "2025-06-10T09:00:00",
  "dateCreation": "2025-06-01T08:00:00",
  "statut": "EN_ATTENTE",
  "motif": "Consultation générale",
  "notes": null
}
```

**Error** `400 Bad Request`: `"string message"` (e.g. patient/médecin/créneau not found or créneau unavailable)

---

### 2. Get All Rendezvous
`GET /api/rendezvous`

**Response** `200 OK`: Array of Rendezvous objects

---

### 3. Get Rendezvous by ID
`GET /api/rendezvous/{id}`

**Response** `200 OK`: Rendezvous object  
**Error** `404 Not Found`

---

### 4. Get Rendezvous by Patient
`GET /api/rendezvous/patient/{patientId}`

**Response** `200 OK`: Array of Rendezvous objects for the given patient

---

### 5. Get Rendezvous by Médecin
`GET /api/rendezvous/medecin/{medecinId}`

**Response** `200 OK`: Array of Rendezvous objects for the given médecin

---

### 6. Change Statut
`PUT /api/rendezvous/{id}/statut`

**Request Body**:
```json
{ "statut": "CONFIRME" }
```
Valid values: `EN_ATTENTE`, `CONFIRME`, `ANNULE`, `TERMINE`

**Response** `200 OK`: Updated Rendezvous object  
**Error** `400 Bad Request`: `"string message"`

---

### 7. Annuler Rendezvous
`PUT /api/rendezvous/{id}/annuler`

**Response** `200 OK`: Updated Rendezvous object (statut set to `ANNULE`)  
**Error** `400 Bad Request`: `"string message"`

---

### 8. Modifier Notes
`PUT /api/rendezvous/{id}/notes`

**Request Body**:
```json
{ "notes": "Patient a confirmé par téléphone." }
```

**Response** `200 OK`: Updated Rendezvous object  
**Error** `400 Bad Request`: `"string message"`

---

### 9. Ping (Health / Latency Check)
`GET /api/ping?url={targetUrl}`

**Query Params**:
- `url`: full URL to ping (e.g. `http://192.168.1.35:8081/api/patients`)

**Response** `200 OK`:
```json
{ "status": "ok", "latency": 42, "url": "http://..." }
```
or on error:
```json
{ "status": "error", "latency": 120, "url": "http://...", "error": "Connection refused" }
```

---

## Status Codes Summary
| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request (validation / business error) |
| 404  | Not Found |

---

## Frontend Integration Example

```javascript
const BASE = 'http://192.168.1.35:8083/api/rendezvous';

// Get all
const getAll = () => fetch(BASE).then(r => r.json());

// Get by patient
const getByPatient = (patientId) => fetch(`${BASE}/patient/${patientId}`).then(r => r.json());

// Create
const create = (rdv) => fetch(BASE, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(rdv)
}).then(r => r.json());

// Change statut
const changeStatut = (id, statut) => fetch(`${BASE}/${id}/statut`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ statut })
}).then(r => r.json());

// Annuler
const annuler = (id) => fetch(`${BASE}/${id}/annuler`, { method: 'PUT' }).then(r => r.json());

// Modifier notes
const modifierNotes = (id, notes) => fetch(`${BASE}/${id}/notes`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notes })
}).then(r => r.json());
```
