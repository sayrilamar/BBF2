export type Money = { amount: number; currency: string };

export function computeValueScore(params: {
  totalPrice: Money;
  durationMinutes: number;
  timeValuePerHour: number;
}): Money {
  const { totalPrice, durationMinutes, timeValuePerHour } = params;

  if (durationMinutes <= 0) throw new Error("durationMinutes must be > 0");
  if (timeValuePerHour < 0 || timeValuePerHour > 200) throw new Error("timeValuePerHour out of range");

  const durationHours = durationMinutes / 60;
  const score = totalPrice.amount + durationHours * timeValuePerHour;

  // NOTE: Currency normalization is out-of-scope for v1.
  return { amount: Number(score.toFixed(2)), currency: totalPrice.currency };
}

export function compareItineraries(a: { valueScore: Money; totalPrice: Money; durationMinutes: number; id: string },
                                   b: { valueScore: Money; totalPrice: Money; durationMinutes: number; id: string }): number {
  if (a.valueScore.amount !== b.valueScore.amount) return a.valueScore.amount - b.valueScore.amount;
  if (a.totalPrice.amount !== b.totalPrice.amount) return a.totalPrice.amount - b.totalPrice.amount;
  if (a.durationMinutes !== b.durationMinutes) return a.durationMinutes - b.durationMinutes;
  return a.id.localeCompare(b.id);
}
