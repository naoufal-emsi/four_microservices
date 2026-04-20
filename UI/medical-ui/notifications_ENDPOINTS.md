# Notification Service API Endpoints

Base path: `/notifications`

All requests and responses use JSON unless otherwise noted.

## Endpoints

### 1) Test endpoint
- Method: `GET`
- URL: `/notifications/test`
- Purpose: health check / quick connectivity test
- Request body: none
- Response example:
```json
"OK"
```

### 2) Create notification and historique
- Method: `POST`
- URL: `/notifications`
- Purpose: create a new notification and save a matching historique entry
- Request headers:
  - `Content-Type: application/json`
- Request body:
```json
{
  "message": "Patient rendezvous cancelled",
  "type": "CANCEL",
  "rendezVousId": 123,
  "patientId": 456
}
```
- Response:
  - `200 OK`
  - body: `"Notification créée avec succès"`

### 3) Get all notifications
- Method: `GET`
- URL: `/notifications`
- Purpose: retrieve every notification record
- Response example:
```json
[
  {
    "id": 1,
    "message": "Patient rendezvous cancelled",
    "type": "CANCEL",
    "date": "2026-04-19T15:02:30",
    "rendezVousId": 123
  },
  {
    "id": 2,
    "message": "Rendezvous created",
    "type": "CREATE",
    "date": "2026-04-19T15:10:12",
    "rendezVousId": 124
  }
]
```

### 4) Get historique by rendezvous ID
- Method: `GET`
- URL: `/notifications/rendezvous/{id}`
- Purpose: retrieve historique entries filtered by `rendezVousId`
- URL parameter:
  - `id` = rendezvous identifier
- Response example:
```json
[
  {
    "id": 10,
    "action": "CANCEL",
    "date": "2026-04-19T15:02:30",
    "rendezVousId": 123,
    "patientId": 456
  }
]
```

### 5) Get notifications by rendezvous ID
- Method: `GET`
- URL: `/notifications/rendezvous/{id}/notifications`
- Purpose: retrieve notifications filtered by `rendezVousId`
- URL parameter:
  - `id` = rendezvous identifier
- Response example:
```json
[
  {
    "id": 1,
    "message": "Patient rendezvous cancelled",
    "type": "CANCEL",
    "date": "2026-04-19T15:02:30",
    "rendezVousId": 123
  }
]
```

### 6) Get historique by patient ID
- Method: `GET`
- URL: `/notifications/patient/{id}`
- Purpose: retrieve historique entries filtered by `patientId`
- URL parameter:
  - `id` = patient identifier
- Response example:
```json
[
  {
    "id": 10,
    "action": "CANCEL",
    "date": "2026-04-19T15:02:30",
    "rendezVousId": 123,
    "patientId": 456
  }
]
```

## Data shapes

### Notification object
- `id`: number
- `message`: string
- `type`: string (`CREATE`, `CANCEL`, `UPDATE`)
- `date`: ISO date-time string
- `rendezVousId`: number

### Historique object
- `id`: number
- `action`: string (`CREATE`, `CANCEL`, `UPDATE`)
- `date`: ISO date-time string
- `rendezVousId`: number
- `patientId`: number

## Notes for UI integration
- Use `POST /notifications` to create both a notification and historique entry in one request.
- Read endpoints are all under `/notifications`.
- The API does not currently expose update or delete operations.
- `date` values are generated server-side as `LocalDateTime.now()`.
- Use `GET /notifications/test` to verify the backend is reachable before calling other endpoints.
