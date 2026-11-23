/** Shared storefront monthly financing estimate (same as PDP). */
export function estimateMonthlyFinancing(amount: number): number {
  return Math.max(1, Math.round((amount || 0) / 51));
}
