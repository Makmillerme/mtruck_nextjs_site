export type FinanceMode = "credit" | "lease";

export type FinancePreset = {
  annualRatePercent: number;
  termMonthsMin: number;
  termMonthsMax: number;
  termMonthsDefault: number;
  /** Months between slider stops. */
  termMonthsStep: number;
  downPaymentPercentMin: number;
  downPaymentPercentMax: number;
  downPaymentPercentDefault: number;
  /** Percent points between slider stops. */
  downPaymentPercentStep: number;
  /** Lease buyout as a percent of the financed price. Null for credit. */
  residualPercent: number | null;
};

export const DEFAULT_CREDIT_PRESET: FinancePreset = {
  annualRatePercent: 14,
  termMonthsMin: 12,
  termMonthsMax: 60,
  termMonthsDefault: 36,
  termMonthsStep: 1,
  downPaymentPercentMin: 0,
  downPaymentPercentMax: 50,
  downPaymentPercentDefault: 20,
  downPaymentPercentStep: 1,
  residualPercent: null,
};

export const DEFAULT_LEASE_PRESET: FinancePreset = {
  annualRatePercent: 12,
  termMonthsMin: 12,
  termMonthsMax: 48,
  termMonthsDefault: 36,
  termMonthsStep: 1,
  downPaymentPercentMin: 0,
  downPaymentPercentMax: 40,
  downPaymentPercentDefault: 10,
  downPaymentPercentStep: 1,
  residualPercent: 45,
};

export type FinancingQuote = {
  monthly: number;
  downAmount: number;
  residualAmount: number;
  total: number;
  months: number;
  downPercent: number;
  annualRatePercent: number;
};

function clamp(value: number, min: number, max: number) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (!Number.isFinite(value)) return lo;
  return Math.min(hi, Math.max(lo, value));
}

function stepSize(value: number, span: number, fallback: number) {
  const raw = Number.isFinite(value) && value > 0 ? value : fallback;
  if (!(span > 0)) return raw;
  return Math.min(raw, span);
}

function snapToStep(value: number, min: number, max: number, step: number) {
  const clamped = clamp(value, min, max);
  if (!(step > 0)) return clamped;
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  return clamp(Number(snapped.toFixed(4)), min, max);
}

function roundMoney(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value);
}

export function normalizePreset(
  preset: FinancePreset,
  mode: FinanceMode
): FinancePreset {
  const termMin = clamp(Math.round(preset.termMonthsMin), 1, 120);
  const termMax = clamp(Math.round(preset.termMonthsMax), termMin, 120);
  const termDefault = clamp(
    Math.round(preset.termMonthsDefault),
    termMin,
    termMax
  );
  const downMin = clamp(preset.downPaymentPercentMin, 0, 100);
  const downMax = clamp(preset.downPaymentPercentMax, downMin, 100);
  const downDefault = clamp(preset.downPaymentPercentDefault, downMin, downMax);
  const termStep = Math.max(
    1,
    Math.round(stepSize(preset.termMonthsStep, termMax - termMin, 1))
  );
  const downStep = stepSize(
    preset.downPaymentPercentStep,
    downMax - downMin,
    1
  );
  const rate = clamp(preset.annualRatePercent, 0, 100);
  const residual =
    mode === "lease"
      ? clamp(preset.residualPercent ?? DEFAULT_LEASE_PRESET.residualPercent ?? 0, 0, 95)
      : null;
  return {
    annualRatePercent: rate,
    termMonthsMin: termMin,
    termMonthsMax: termMax,
    termMonthsDefault: termDefault,
    termMonthsStep: termStep,
    downPaymentPercentMin: downMin,
    downPaymentPercentMax: downMax,
    downPaymentPercentDefault: downDefault,
    downPaymentPercentStep: downStep,
    residualPercent: residual,
  };
}

function annuity(principal: number, annualRatePercent: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  );
}

/** Credit annuity or lease depreciation + rent charge. Amounts stay in the caller's currency. */
export function financingQuote(
  baseAmount: number,
  mode: FinanceMode,
  preset: FinancePreset,
  downPercent: number,
  months: number
): FinancingQuote {
  const terms = normalizePreset(preset, mode);
  const base = Math.max(0, baseAmount);
  const down = snapToStep(
    downPercent,
    terms.downPaymentPercentMin,
    terms.downPaymentPercentMax,
    terms.downPaymentPercentStep
  );
  const term = Math.round(
    snapToStep(
      months,
      terms.termMonthsMin,
      terms.termMonthsMax,
      terms.termMonthsStep
    )
  );
  const downAmount = (base * down) / 100;
  const principal = Math.max(0, base - downAmount);
  let residualAmount = 0;
  let monthly = 0;
  if (mode === "credit") {
    monthly = annuity(principal, terms.annualRatePercent, term);
  } else {
    residualAmount = (base * (terms.residualPercent ?? 0)) / 100;
    const depreciation =
      term > 0 ? Math.max(0, principal - residualAmount) / term : 0;
    const moneyFactor = terms.annualRatePercent / 2400;
    const financeFee = (principal + residualAmount) * moneyFactor;
    monthly = depreciation + financeFee;
  }
  const roundedMonthly = roundMoney(monthly);
  return {
    monthly: roundedMonthly,
    downAmount: roundMoney(downAmount),
    residualAmount: roundMoney(residualAmount),
    total: roundMoney(roundedMonthly * term + downAmount),
    months: term,
    downPercent: down,
    annualRatePercent: terms.annualRatePercent,
  };
}

export type FinancingMoneyLine = {
  currencyCode: string;
  /** Multiply a main-currency amount to express it in this currency. */
  perMain: number;
};

export type FinancingFactVisibility = {
  down: boolean;
  residual: boolean;
  total: boolean;
  rate: boolean;
};

export const DEFAULT_FINANCING_FACTS: FinancingFactVisibility = {
  down: true,
  residual: true,
  total: true,
  rate: true,
};

export type FinancingOffer = {
  /** Financed price in the main display currency. */
  baseAmount: number;
  includesVat: boolean;
  credit: FinancePreset;
  lease: FinancePreset;
  lines: FinancingMoneyLine[];
  facts: FinancingFactVisibility;
};

/** Cheaper monthly of credit and lease, each at its lowest advance and longest term. */
export function lowerDefaultMonthly(
  baseAmount: number,
  credit: FinancePreset,
  lease: FinancePreset
) {
  const creditQuote = financingQuote(
    baseAmount,
    "credit",
    credit,
    credit.downPaymentPercentMin,
    credit.termMonthsMax
  );
  const leaseQuote = financingQuote(
    baseAmount,
    "lease",
    lease,
    lease.downPaymentPercentMin,
    lease.termMonthsMax
  );
  return Math.min(creditQuote.monthly, leaseQuote.monthly);
}
