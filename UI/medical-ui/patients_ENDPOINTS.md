# Patient Service API Documentation

## Overview
This document provides comprehensive information about the Patient Service microservice endpoints, data models, and integration details for UI development.

## Base Configuration
- **Base URL**: `http://localhost:8081`
- **Service Name**: patient-service
- **Port**: 8081
- **Content-Type**: `application/json`

## Data Models

### Patient
```json
{
  "id": "number (auto-generated)",
  "nom": "string (required)",
  "prenom": "string (required)",
  "telephone": "string (optional)",
  "email": "string (email format, optional)",
  "adresse": "string (optional)",
  "statut": "string (optional)"
}
```

### PatientDecision
```json
{
  "decision": "string",
  "raisonPrincipale": "string",
  "risques": ["string"],
  "actionRecommandee": "string"
}
```

## API Endpoints

### 1. Create Patient
**Endpoint**: `POST /patients`  
**Description**: Add a new patient to the system

**Request Body**:
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33123456789",
  "email": "jean.dupont@email.com",
  "adresse": "123 Rue de la Santé, Paris",
  "statut": "Actif"
}
```

**Response**: Patient object with generated ID
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33123456789",
  "email": "jean.dupont@email.com",
  "adresse": "123 Rue de la Santé, Paris",
  "statut": "Actif"
}
```

**Validation Rules**:
- `nom` and `prenom` are required
- `email` must be valid email format if provided

---

### 2. Get All Patients
**Endpoint**: `GET /patients`  
**Description**: Retrieve all patients

**Response**: Array of Patient objects
```json
[
  {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+33123456789",
    "email": "jean.dupont@email.com",
    "adresse": "123 Rue de la Santé, Paris",
    "statut": "Actif"
  }
]
```

---

### 3. Get Patient by ID
**Endpoint**: `GET /patients/{id}`  
**Description**: Retrieve a specific patient by ID

**Path Parameters**:
- `id`: Patient ID (number)

**Response**: Patient object
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33123456789",
  "email": "jean.dupont@email.com",
  "adresse": "123 Rue de la Santé, Paris",
  "statut": "Actif"
}
```

**Error Response** (404):
```json
{
  "timestamp": "2026-04-19T...",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: {id}",
  "path": "/patients/{id}"
}
```

---

### 4. Update Patient
**Endpoint**: `PUT /patients/{id}`  
**Description**: Update an existing patient

**Path Parameters**:
- `id`: Patient ID (number)

**Request Body**: Patient object (all fields optional for partial update)
```json
{
  "nom": "Dupont",
  "prenom": "Jean-Marie",
  "telephone": "+33123456789",
  "email": "jean-marie.dupont@email.com",
  "adresse": "456 Rue de la Santé, Paris",
  "statut": "Actif"
}
```

**Response**: Updated Patient object
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean-Marie",
  "telephone": "+33123456789",
  "email": "jean-marie.dupont@email.com",
  "adresse": "456 Rue de la Santé, Paris",
  "statut": "Actif"
}
```

---

### 5. Delete Patient
**Endpoint**: `DELETE /patients/{id}`  
**Description**: Delete a patient by ID

**Path Parameters**:
- `id`: Patient ID (number)

**Response**:
```json
{
  "message": "Patient supprimé avec succès"
}
```

---

### 6. Check Patient Existence
**Endpoint**: `GET /patients/exists/{id}`  
**Description**: Check if a patient exists by ID

**Path Parameters**:
- `id`: Patient ID (number)

**Response**:
```json
{
  "exists": true
}
```

---

### 7. Get External Configuration
**Endpoint**: `GET /patients/config/external`  
**Description**: Get external cloud configuration URLs

**Response**:
```json
{
  "service.rendezvous.url": "http://localhost:8084/rendezvous",
  "service.history.url": "http://localhost:8085/history",
  "service.notification.url": "http://localhost:8085/notifications"
}
```

---

### 8. Get Patient Decision
**Endpoint**: `GET /patients/{id}/decision`  
**Description**: Get AI analysis decision for a patient

**Path Parameters**:
- `id`: Patient ID (number)

**Response**: PatientDecision object
```json
{
  "decision": "Admission requise",
  "raisonPrincipale": "Score de risque élevé",
  "risques": [
    "Tension artérielle instable",
    "Fréquence cardiaque anormale"
  ],
  "actionRecommandee": "Surveillance continue et traitement immédiat"
}
```

## Error Handling

### Common HTTP Status Codes
- **200 OK**: Successful operation
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation error
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Validation Errors (400)
```json
{
  "timestamp": "2026-04-19T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "nom",
      "message": "Le nom est obligatoire"
    },
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## Integration Notes for UI

### CORS Configuration
The service may require CORS configuration for web UI integration. Add the following to `application.properties` if needed:
```
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### Authentication
Currently, no authentication is implemented. Consider adding Spring Security if authentication is required.

### Database Configuration
The service uses MySQL database:
- **Database**: patient_db
- **Host**: 127.0.0.1:3306
- **Username**: root
- **Password**: (empty)

### External Services
The service integrates with other microservices:
- **Rendezvous Service**: `http://localhost:8084/rendezvous`
- **History Service**: `http://localhost:8085/history`
- **Notification Service**: `http://localhost:8085/notifications`

## Example Frontend Integration

### JavaScript/Fetch API Example
```javascript
// Get all patients
const getAllPatients = async () => {
  try {
    const response = await fetch('http://localhost:8081/patients');
    const patients = await response.json();
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
};

// Create new patient
const createPatient = async (patientData) => {
  try {
    const response = await fetch('http://localhost:8081/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    const newPatient = await response.json();
    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8081/patients';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error('Failed to add patient');
      const newPatient = await response.json();
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { patients, loading, error, addPatient, fetchPatients };
};
```

## Testing the API

You can test the endpoints using tools like:
- **Postman**: Import the collection from this documentation
- **curl**: Command line testing
- **Browser**: For GET requests
- **Swagger/OpenAPI**: Can be added later for interactive documentation

### Sample curl Commands
```bash
# Get all patients
curl -X GET http://localhost:8081/patients

# Create patient
curl -X POST http://localhost:8081/patients \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"Patient","email":"test@example.com"}'

# Get patient by ID
curl -X GET http://localhost:8081/patients/1

# Update patient
curl -X PUT http://localhost:8081/patients/1 \
  -H "Content-Type: application/json" \
  -d '{"nom":"Updated","prenom":"Name"}'

# Delete patient
curl -X DELETE http://localhost:8081/patients/1
```