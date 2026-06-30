require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./db');
const estimatePatientOwes = require('./estimate');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/estimate', async (req, res) => {
  const { insurance_id, symptoms } = req.body;

  if (!insurance_id || !symptoms) {
    return res.status(400).json({ error: 'Missing insurance_id or symptoms' });
  }

  const patient = await prisma.patient.findUnique({
    where: { insurance_id },
    include: { plan: true },
  });

  if (!patient) {
    return res.status(404).json({ error: 'Insurance ID not found' });
  }

  const symptomWords = symptoms.toLowerCase().split(/\W+/).filter(Boolean);

  const allCodes = await prisma.cptCode.findMany();

  const matched_codes = allCodes
    .filter(cpt => {
      const keywords = cpt.keywords.split(',').map(k => k.trim().toLowerCase());
      return keywords.some(kw => symptomWords.includes(kw));
    })
    .map(cpt => ({
      code: cpt.code,
      description: cpt.description,
      base_price: cpt.base_price,
    }));

  const total_price = matched_codes.reduce((sum, c) => sum + c.base_price, 0);
  const total_estimated_cost = estimatePatientOwes(patient.plan, total_price);

  res.json({
    patient_name: patient.name,
    plan_name: patient.plan.plan_name,
    matched_codes,
    total_estimated_cost,
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
