// Display only: numeric inputs, saved values and calculations remain numbers.
const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 15 });
export const displayNumber = (value) =>
  Number.isFinite(value) ? formatter.format(value) : "—";
