# Insurance Cost Estimator — Project Spec

## What this app does
A patient logs in and enters a description of their symptoms. The app looks up their insurance plan from their account, matches their symptoms to relevant CPT codes, and returns an estimated out-of-pocket cost.
---

## Tech stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React (Vite)                |
| Backend  | Node.js + Express           |
| Database | SQLite via `better-sqlite3` |

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
│   ├── SPEC_db.md
│   └── SPEC_estimate.md
└── package.json
```

---

## Database schema

### `patients`
| Column       | Type | Notes                     |
|--------------|------|---------------------------|
| insurance_id | TEXT | Primary key               |
| name         | TEXT |                           |
| plan_id      | TEXT | Foreign key → insurance_plans |

### `insurance_plans`
| Column          | Type | Notes                            |
|-----------------|------|----------------------------------|
| plan_id         | TEXT | Primary key                      |
| plan_name       | TEXT |                                  |
| deductible      | REAL | Total annual deductible          |
| deductible_met  | REAL | Amount already paid this year    |
| copay_pct       | REAL | Patient's share after deductible (0.0–1.0) |
| out_of_pocket_max | REAL | Maximum patient pays per year  |

### `cpt_codes`
| Column      | Type | Notes                                          |
|-------------|------|------------------------------------------------|
| code        | TEXT | Primary key (e.g. "99213")                     |
| description | TEXT | Human-readable name                            |
| keywords    | TEXT | Comma-separated symptom words for matching     |
| base_price  | REAL | Standard procedure price before insurance      |

### `users`
| Column       | Type | Notes                          |
|--------------|------|--------------------------------|
| user_id      | TEXT | Primary key                    |
| username     | TEXT | Unique                         |
| password     | TEXT | Hashed, never plaintext        |
| insurance_id | TEXT | Foreign key → patients         |

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
