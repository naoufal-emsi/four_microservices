# Planning Microservice API (UI Integration)

This document describes everything a UI needs to call the Planning microservice (Spring Boot).  

## Service URL

- Default base URL: `http://localhost:9090`  
- Health check: `GET /` returns plain text: `Planning Service is running`  

### Runtime configuration (env vars)

The service uses these properties (see `src/main/resources/application.properties`):  

- `SERVER_PORT` (default `9090`)  
- `SERVICE_MEDECIN_URL` (default `http://localhost:8082/medecins`)  
- `PLANNING_DB_URL` (default `jdbc:postgresql://localhost:5432/planning_db`)  
- `PLANNING_DB_USERNAME` (default `postgres`)  
- `PLANNING_DB_PASSWORD` (default `postgres`)  
- `planning.simulate.medecin-service.down` (default `false`)  
  - When `true`, the API simulates the external dependency being down and will return `503` for operations that require checking the doctor (see `PUT /creneaux/{id}/bloquer`).  

## Auth and CORS

- Authentication: none (no Spring Security configured).  
- CORS: not configured in this repo.  
  - If the UI runs on a different origin (different host/port), browser requests will fail unless you:  
    - add a CORS config on the backend, or  
    - use a dev proxy in the UI (recommended for local dev).  

## Content types and formats

- Send JSON with `Content-Type: application/json` for requests with a body.  
- Responses are JSON except `GET /` which is plain text.  
- `LocalDate` format: `YYYY-MM-DD` (example: `2026-04-19`)  
- `LocalTime` format: `HH:mm:ss` (example: `14:30:00`)  

## Error response format

When the API returns an error, it responds with JSON:  

```json
{  
  "error": "CRENEAU_NOT_FOUND",  "message": "Creneau not found (id=123).",  "status": 404}  
```

Common error types:  

- `400 BAD_REQUEST`  
  - missing query params (example: missing `year`/`month`)  
  - invalid param types (example: `month=abc`)  
  - invalid param values (example: `month=13`, `year=0`)  
- `404 CRENEAU_NOT_FOUND`  
- `404 MEDECIN_NOT_FOUND` (only possible when blocking a slot and the slot has an invalid `medecinId`)  
- `409 CRENEAU_CONFLICT` (state conflict, concurrent update, already blocked/available)  
- `503 DEPENDENCY_UNAVAILABLE` (simulated external dependency down)  
- `500 INTERNAL_ERROR` (unexpected error)  

## Data model

### Creneau

JSON shape returned by the API:  

```json
{  
  "id": 1,  "medecinId": 10,  "date": "2026-04-19",  "heureDebut": "09:00:00",  "heureFin": "09:30:00",  "disponible": true}  
```

Notes (backend behavior that affects the UI):  

- On create, the service ignores any `id` you send and generates a new one.  
- The service may "self-heal" invalid records and persist corrections:  
  - missing `date` defaults to "today"  
  - missing `heureDebut` defaults to "now" (server time)  
  - missing `heureFin` defaults to `heureDebut + 30 minutes`  
  - if `heureFin` is not after `heureDebut`, it is corrected to `heureDebut + 30 minutes`  
  - if `medecinId` is missing/invalid (`<= 0`) and `disponible=true`, it will be forced to `disponible=false`  
  - if a slot ended in the past, it will be forced to `disponible=false`  

### MedecinStatsDTO

Returned by the stats endpoint:  

```json
{  
  "medecinId": 10,  "nbCreneauxReserves": 7}  
```

## Endpoints

Base path for all slot endpoints: `/creneaux`  

### 1) Health

#### `GET /`

Response:  

- `200 OK` (plain text)  

Example:  

```http
GET http://localhost:9090/  
```

### 2) List all slots

#### `GET /creneaux`

Returns all slots sorted by `(date, heureDebut)` ascending.  

Response:  

- `200 OK` with `Creneau[]`  

Example:  

```http
GET http://localhost:9090/creneaux  
```

### 3) Get one slot by id

#### `GET /creneaux/{id}`

Path params:  

- `id` (number)  

Response:  

- `200 OK` with `Creneau`  
- `404` if not found  

Example:  

```http
GET http://localhost:9090/creneaux/123  
```

### 4) List available slots

#### `GET /creneaux/disponibles`

Returns slots that are available *and not expired*.  

Response:  

- `200 OK` with `Creneau[]`  

Example:  

```http
GET http://localhost:9090/creneaux/disponibles  
```

### 5) List slots for a doctor

#### `GET /creneaux/medecin/{medecinId}`

Path params:  

- `medecinId` (number)  

Response:  

- `200 OK` with `Creneau[]` sorted by `(date, heureDebut)` ascending  

Example:  

```http
GET http://localhost:9090/creneaux/medecin/10  
```

### 6) Monthly stats (reserved slots per doctor)

#### `GET /creneaux/stats/medecins?year=YYYY&month=M`

Query params:  

- `year` (int, must be `>= 1`)  
- `month` (int, must be `1..12`)  

Definition: a "reserved" slot is a `Creneau` where `disponible=false`.  

Response:  

- `200 OK` with `MedecinStatsDTO[]`  
- `400` for invalid/missing params  

Example:  

```http
GET http://localhost:9090/creneaux/stats/medecins?year=2026&month=4  
```

### 7) Create a slot

#### `POST /creneaux`

Body: `Creneau` (the service will generate `id`).  

Response:  

- `201 Created` with `Creneau`  
  - `Location` header points to `/creneaux/{id}`  
- `400` if body is missing/invalid (example: null body)  

Example:  

```http
POST http://localhost:9090/creneaux  
Content-Type: application/json  

{  
  "medecinId": 10,  "date": "2026-04-19",  "heureDebut": "09:00:00",  "heureFin": "09:30:00",  "disponible": true}  
```

### 8) Block (reserve) a slot

#### `PUT /creneaux/{id}/bloquer`

No body.  

Behavior:  

- Only works if the slot is currently `disponible=true`.  
- Performs an external dependency check (doctor service) in an academic/simulated way:  
  - if `planning.simulate.medecin-service.down=true`, the API returns `503`  
  - if the slot has an invalid `medecinId` (`<= 0`), the API returns `404 MEDECIN_NOT_FOUND`  

Response:  

- `200 OK` with updated `Creneau` (`disponible=false`)  
- `404` if slot not found  
- `404` if doctor not found (invalid `medecinId`)  
- `409` if already blocked or concurrent update  
- `503` if dependency unavailable (simulation)  

Example:  

```http
PUT http://localhost:9090/creneaux/123/bloquer  
```

### 9) Free a slot

#### `PUT /creneaux/{id}/liberer`

No body.  

Behavior:  

- If the slot is expired (its `date + heureFin` is before server "now"), it will NOT become available again.  
  - In that case the API returns `200` and returns the slot unchanged.  

Response:  

- `200 OK` with updated `Creneau` (`disponible=true`) if not expired  
- `404` if slot not found  
- `409` if already available or concurrent update  

Example:  

```http
PUT http://localhost:9090/creneaux/123/liberer  
```

## UI calling examples

### Browser `fetch`

```js
const baseUrl = "http://localhost:9090";  

export async function listDisponibles() {  
  const res = await fetch(`${baseUrl}/creneaux/disponibles`);  if (!res.ok) throw await res.json();  return res.json();}  

export async function bloquerCreneau(id) {  
  const res = await fetch(`${baseUrl}/creneaux/${id}/bloquer`, { method: "PUT" });  if (!res.ok) throw await res.json();  return res.json();}  
```

### Handling errors in the UI

- Treat the error body as `ApiErrorResponse` (see format above).  
- For `409 CRENEAU_CONFLICT`, refresh the slot state from `GET /creneaux/{id}` and update the UI.  
- For `503 DEPENDENCY_UNAVAILABLE`, display a retry message (dependency down).
