# Insurance Cost Estimator — Project Spec

## What this app does

A patient enters their insurance ID and a description of their symptoms. The app looks up their insurance plan, matches their symptoms to relevant CPT (medical procedure) codes, and returns an estimated out-of-pocket cost based on their plan's deductible, copay percentage, and out-of-pocket maximum.

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
├── client/          # React frontend (Vite)
│   └── src/
│       ├── App.jsx
│       └── main.jsx
├── server/          # Express backend
│   ├── index.js     # Server entry point, route definitions
│   ├── db.js        # Database connection + seed data
│   └── estimate.js  # Cost estimation logic
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

---

## API endpoints

### `POST /api/estimate`

**Request body:**
```json
{
  "insurance_id": "INS-001",
  "symptoms": "chest pain and shortness of breath"
}
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
      "base_price": 150.00,
      "patient_owes": 87.50
    }
  ],
  "total_estimated_cost": 87.50
}
```

**Error responses:**
- `404` — insurance ID not found
- `400` — missing fields
- `200` with empty `matched_codes` — no CPT codes matched the symptoms

---

## Cost estimation logic
For each matched CPT code, get the base_price, and sum them all together in total_price.

Then, calculate what the patient owes:

```
remaining_deductible = plan.deductible - plan.deductible_met

if total_price <= remaining_deductible:
    total_estimated_cost = total_price
else:
    above_deductible = total_price - remaining_deductible
    total_estimated_cost = remaining_deductible + (above_deductible * plan.copay_pct)
    total_estimated_cost = min(total_estimated_cost, out_of_pocket_max)
```

---

## Symptom → CPT matching logic

Split the symptoms string into individual words. For each CPT code, check if any keyword in its `keywords` column appears in the symptoms string. Return all codes with at least one match.

Example: symptoms = `"chest pain"` matches a CPT code with keywords `"chest, pain, cardiac"`.

---

## Seed data (for development)

### Patients
| insurance_id | name          | plan_id  |
|--------------|---------------|----------|
| INS-001      | Jane Smith    | PLAN-A   |
| INS-002      | Carlos Rivera | PLAN-B   |
| INS-003      | Amy Chen      | PLAN-C   |

### Insurance plans
| plan_id | plan_name         | deductible | deductible_met | copay_pct | out_of_pocket_max |
|---------|-------------------|------------|----------------|-----------|-------------------|
| PLAN-A  | BlueCross Silver  | 1000       | 800            | 0.20      | 3000              |
| PLAN-B  | Aetna Bronze      | 3000       | 200            | 0.40      | 6000              |
| PLAN-C  | United Gold       | 500        | 500            | 0.10      | 1500              |

### CPT codes (sample)
| code  | description              | keywords                        | base_price |
|-------|---------------------------|---------------------------------|------------|
| 99213 | Office visit (est. pt.)   | pain, visit, consult, ache      | 150        |
| 93000 | Electrocardiogram (ECG)   | chest, heart, cardiac, palpitation | 200     |
| 71046 | Chest X-ray               | chest, cough, breath, lung      | 300        |
| 80053 | Metabolic panel (blood)   | fatigue, dizzy, nausea, blood   | 180        |
| 99203 | Office visit (new pt.)    | new, first, initial, visit      | 220        |
| 97110 | Therapeutic exercise      | knee, back, shoulder, joint, pain | 120      |
