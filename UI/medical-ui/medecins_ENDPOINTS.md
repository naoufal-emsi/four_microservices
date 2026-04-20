# Medecin Service API Endpoints

This document lists all REST endpoints exposed by the microservice so a UI can connect and use it.

> Base URL: `http://<host>:<port>`

---

## Medecin Endpoints

### 1. List all médecins
- Method: `GET`
- URL: `/medecins`
- Response: `200 OK`
- Returns: JSON array of `Medecin` objects.

### 2. Get médecin by ID
- Method: `GET`
- URL: `/medecins/{id}`
- Path parameter: `id` (integer)
- Response: `200 OK` with médecin object, or `404 Not Found` if missing.

### 3. Create a médecin
- Method: `POST`
- URL: `/medecins`
- Request body: JSON object
  - `nom`: string
  - `prenom`: string
  - `email`: string
  - `telephone`: string
  - `disponible`: boolean
  - `specialite`: object
    - `id`: integer
    - `nom`: string
    - `description`: string
- Response: `201 Created` with created `Medecin` object.

### 4. Update a médecin
- Method: `PUT`
- URL: `/medecins/{id}`
- Path parameter: `id` (integer)
- Request body: same schema as `POST /medecins`
- Response: `200 OK` with updated `Medecin`, or `404 Not Found` if not found.

### 5. Delete a médecin
- Method: `DELETE`
- URL: `/medecins/{id}`
- Path parameter: `id` (integer)
- Response: `200 OK` with success message.

### 6. List médecins disponibles
- Method: `GET`
- URL: `/medecins/disponibles`
- Response: `200 OK`
- Returns: JSON array of médecins where `disponible` is `true`.

### 7. List médecins by spécialité
- Method: `GET`
- URL: `/medecins/specialite/{specialiteId}`
- Path parameter: `specialiteId` (integer)
- Response: `200 OK`
- Returns: JSON array of médecins filtered by specialité.

### 8. Check médecin availability
- Method: `GET`
- URL: `/medecins/{id}/disponibilite`
- Path parameter: `id` (integer)
- Response: `200 OK` with JSON:
  - `medecinId`: integer
  - `disponible`: boolean
- Error: `404 Not Found` if médecin does not exist.

### 9. Mark médecin as occupied
- Method: `PUT`
- URL: `/medecins/{id}/occuper`
- Path parameter: `id` (integer)
- Response: `200 OK` with updated `Medecin` object, or `404 Not Found`.

### 10. Mark médecin as available
- Method: `PUT`
- URL: `/medecins/{id}/liberer`
- Path parameter: `id` (integer)
- Response: `200 OK` with updated `Medecin` object, or `404 Not Found`.

### 11. Get médecin charge score
- Method: `GET`
- URL: `/medecins/{id}/score`
- Path parameter: `id` (integer)
- Response: `200 OK` with a score object or value.
- Error: `404 Not Found` if médecin not found.

### 12. Recommend médecin by spécialité
- Method: `GET`
- URL: `/medecins/recommander/{specialiteId}`
- Path parameter: `specialiteId` (integer)
- Response: `200 OK` with recommended médecin data.

### 13. Get global analysis report
- Method: `GET`
- URL: `/medecins/analyse/rapport`
- Response: `200 OK` with analysis report data.

---

## Spécialité Endpoints

### 14. List all spécialités
- Method: `GET`
- URL: `/specialites`
- Response: `200 OK`
- Returns: JSON array of `Specialite` objects.

### 15. Get spécialité by ID
- Method: `GET`
- URL: `/specialites/{id}`
- Path parameter: `id` (integer)
- Response: `200 OK` with spécialité object, or `404 Not Found`.

### 16. Create a spécialité
- Method: `POST`
- URL: `/specialites`
- Request body: JSON object
  - `nom`: string
  - `description`: string
- Response: `201 Created` with created `Specialite` object.

### 17. Delete a spécialité
- Method: `DELETE`
- URL: `/specialites/{id}`
- Path parameter: `id` (integer)
- Response: `200 OK` with success message.

---

## Data Models

### Medecin
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "telephone": "0123456789",
  "disponible": true,
  "specialite": {
    "id": 1,
    "nom": "Cardiologie",
    "description": "Spécialité médicale du cœur"
  }
}
```

### Specialite
```json
{
  "id": 1,
  "nom": "Cardiologie",
  "description": "Spécialité médicale du cœur"
}
```

---

## Notes for UI Integration
- Use JSON `Content-Type: application/json` for `POST` and `PUT` requests.
- For `POST /medecins`, include `specialite.id` when linking an existing spécialité.
- Error responses may return string messages or JSON objects with `erreur`.
- The service is built with Spring Boot and listens on the configured port in `application.properties`.
