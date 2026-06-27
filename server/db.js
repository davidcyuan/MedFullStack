const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS insurance_plans (
    plan_id          TEXT PRIMARY KEY,
    plan_name        TEXT,
    deductible       REAL,
    deductible_met   REAL,
    copay_pct        REAL,
    out_of_pocket_max REAL
  );

  CREATE TABLE IF NOT EXISTS patients (
    insurance_id TEXT PRIMARY KEY,
    name         TEXT,
    plan_id      TEXT REFERENCES insurance_plans(plan_id)
  );

  CREATE TABLE IF NOT EXISTS cpt_codes (
    code        TEXT PRIMARY KEY,
    description TEXT,
    keywords    TEXT,
    base_price  REAL
  );
`);

const insertPlan = db.prepare(`
  INSERT OR IGNORE INTO insurance_plans (plan_id, plan_name, deductible, deductible_met, copay_pct, out_of_pocket_max)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPatient = db.prepare(`
  INSERT OR IGNORE INTO patients (insurance_id, name, plan_id)
  VALUES (?, ?, ?)
`);

const insertCpt = db.prepare(`
  INSERT OR IGNORE INTO cpt_codes (code, description, keywords, base_price)
  VALUES (?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  insertPlan.run('PLAN-A', 'BlueCross Silver', 1000, 800,  0.20, 3000);
  insertPlan.run('PLAN-B', 'Aetna Bronze',     3000, 200,  0.40, 6000);
  insertPlan.run('PLAN-C', 'United Gold',       500, 500,  0.10, 1500);

  insertPatient.run('INS-001', 'Jane Smith',    'PLAN-A');
  insertPatient.run('INS-002', 'Carlos Rivera', 'PLAN-B');
  insertPatient.run('INS-003', 'Amy Chen',      'PLAN-C');

  insertCpt.run('99213', 'Office visit (est. pt.)', 'pain, visit, consult, ache',           150);
  insertCpt.run('93000', 'Electrocardiogram (ECG)', 'chest, heart, cardiac, palpitation',   200);
  insertCpt.run('71046', 'Chest X-ray',             'chest, cough, breath, lung',           300);
  insertCpt.run('80053', 'Metabolic panel (blood)',  'fatigue, dizzy, nausea, blood',        180);
  insertCpt.run('99203', 'Office visit (new pt.)',   'new, first, initial, visit',           220);
  insertCpt.run('97110', 'Therapeutic exercise',     'knee, back, shoulder, joint, pain',   120);
});

seed();

module.exports = db;
