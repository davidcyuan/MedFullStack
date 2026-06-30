const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function main() {
  await prisma.insurancePlan.createMany({
    data: [
      { plan_id: 'PLAN-A', plan_name: 'BlueCross Silver', deductible: 1000, deductible_met: 800,  copay_pct: 0.20, out_of_pocket_max: 3000 },
      { plan_id: 'PLAN-B', plan_name: 'Aetna Bronze',     deductible: 3000, deductible_met: 200,  copay_pct: 0.40, out_of_pocket_max: 6000 },
      { plan_id: 'PLAN-C', plan_name: 'United Gold',      deductible: 500,  deductible_met: 500,  copay_pct: 0.10, out_of_pocket_max: 1500 },
    ],
    skipDuplicates: true,
  });

  await prisma.patient.createMany({
    data: [
      { insurance_id: 'INS-001', name: 'Jane Smith',    plan_id: 'PLAN-A' },
      { insurance_id: 'INS-002', name: 'Carlos Rivera', plan_id: 'PLAN-B' },
      { insurance_id: 'INS-003', name: 'Amy Chen',      plan_id: 'PLAN-C' },
    ],
    skipDuplicates: true,
  });

  await prisma.cptCode.createMany({
    data: [
      { code: '99213', description: 'Office visit (est. pt.)', keywords: 'pain, visit, consult, ache',          base_price: 150 },
      { code: '93000', description: 'Electrocardiogram (ECG)', keywords: 'chest, heart, cardiac, palpitation', base_price: 200 },
      { code: '71046', description: 'Chest X-ray',             keywords: 'chest, cough, breath, lung',         base_price: 300 },
      { code: '80053', description: 'Metabolic panel (blood)', keywords: 'fatigue, dizzy, nausea, blood',      base_price: 180 },
      { code: '99203', description: 'Office visit (new pt.)',  keywords: 'new, first, initial, visit',         base_price: 220 },
      { code: '97110', description: 'Therapeutic exercise',    keywords: 'knee, back, shoulder, joint, pain',  base_price: 120 },
    ],
    skipDuplicates: true,
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      { user_id: 'USR-001', username: 'jsmith',  password: hashedPassword, insurance_id: 'INS-001' },
      { user_id: 'USR-002', username: 'crivera', password: hashedPassword, insurance_id: 'INS-002' },
      { user_id: 'USR-003', username: 'achen',   password: hashedPassword, insurance_id: 'INS-003' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
