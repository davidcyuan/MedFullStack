const express = require('express');
const cors = require('cors');
const db = require('./db');
const estimatePatientOwes = require('./estimate');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/estimate', (req, res) => {
  const { insurance_id, symptoms } = req.body;

  if (!insurance_id || !symptoms) {
    return res.status(400).json({ error: 'Missing insurance_id or symptoms' });
  }

  const patient = db.prepare(`
    SELECT p.name AS patient_name, ip.*
    FROM patients p
    JOIN insurance_plans ip ON p.plan_id = ip.plan_id
    WHERE p.insurance_id = ?
  `).get(insurance_id);

  if (!patient) {
    return res.status(404).json({ error: 'Insurance ID not found' });
  }

  const symptomWords = symptoms.toLowerCase().split(/\W+/).filter(Boolean);

  const allCodes = db.prepare('SELECT * FROM cpt_codes').all();

  const matched_codes = allCodes
    .filter(cpt => {
      const keywords = cpt.keywords.split(',').map(k => k.trim().toLowerCase());
      return keywords.some(kw => symptomWords.includes(kw));
    })
    .map(cpt => ({
      code: cpt.code,
      description: cpt.description,
      base_price: cpt.base_price,
      patient_owes: estimatePatientOwes(patient, cpt.base_price),
    }));

  const total_estimated_cost = matched_codes.reduce((sum, c) => sum + c.patient_owes, 0);

  res.json({
    patient_name: patient.patient_name,
    plan_name: patient.plan_name,
    matched_codes,
    total_estimated_cost,
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
