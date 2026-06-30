# Insurance Cost Estimator — Project Spec

## What this app does
A patient logs in and enters a description of their symptoms. The app looks up their insurance plan from their account, matches their symptoms to relevant CPT codes, and returns an estimated out-of-pocket cost.
---

## Tech stack
| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React (Vite)                |
| Backend  | Node.js + Express           |
| Database | Postgres on AWS RDS         |
---

## Folder structure
```
/
├── SPEC.md
├── client/
│   └── src/
│       ├── App.jsx
│       ├── LoginPage.jsx
│       ├── SymptomsPage.jsx
│       └── main.jsx
├── server/
│   ├── index.js
│   ├── db.js
│   ├── estimate.js
│   ├── SPEC_backend.md
└── package.json
```
---

## Frontend Pages
- `/login` — login form, redirects to /symptoms on success
- `/symptoms` — symptoms input form, requires active session, 
   redirects to /login if not authenticated

## API endpoints

### `POST /api/login`
**Request body:**
```json
{ "username": "jsmith", "password": "password123" }
```
**Response:**
- `200` — login successful, session cookie set
- `401` — invalid credentials
---
 
### `POST /api/logout`
**Request body:** none
**Response:**
- `200` — session cleared
---

### `POST /api/estimate`
Requires active session. Returns `401` if not authenticated.
The insurance_id is retrieved server-side from the session — 
it is never supplied by the client.

**Request body:**
```json
{ "symptoms": "chest pain and shortness of breath" }
```
**Response:**
```json
{
  "patient_name": "Jane Smith",
  "plan_name": "BlueCross Silver",
  "matched_codes": [
    {
      "code": "99213",
      "description": "Office visit",
      "base_price": 150.00
    }
  ],
  "total_estimated_cost": 87.50
}
```
Requires active session. Returns `401` if not authenticated.
