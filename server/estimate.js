function estimatePatientOwes(plan, base_price) {
  const remaining_deductible = plan.deductible - plan.deductible_met;

  let patient_owes;
  if (base_price <= remaining_deductible) {
    patient_owes = base_price;
  } else {
    const above_deductible = base_price - remaining_deductible;
    patient_owes = remaining_deductible + above_deductible * plan.copay_pct;
  }

  return Math.min(patient_owes, plan.out_of_pocket_max);
}

module.exports = estimatePatientOwes;
