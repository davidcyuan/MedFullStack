function estimatePatientOwes(plan, total_price) {
  const remaining_deductible = plan.deductible - plan.deductible_met;

  let total_estimated_cost;
  if (total_price <= remaining_deductible) {
    total_estimated_cost = total_price;
  } else {
    const above_deductible = total_price - remaining_deductible;
    total_estimated_cost = remaining_deductible + above_deductible * plan.copay_pct;
    total_estimated_cost = Math.min(total_estimated_cost, plan.out_of_pocket_max);
  }

  return total_estimated_cost;
}

module.exports = estimatePatientOwes;
