"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import {
  createCurrencyFromIso,
  deleteCurrency,
  updateCurrency,
  updateFinanceSettings,
} from "@/lib/finance/currencies";
import {
  saveRootFinancing,
  setRootFinancingEnabled,
  upsertRootPricing,
} from "@/lib/finance/root-pricing";
import { getAdminUser } from "@/utils/session";
import type { ActionState } from "@/utils/types";

const currencyFormSchema = z.object({
  code: z.string().trim().min(3).max(3),
  isActive: z.boolean(),
  isBuyerVisible: z.boolean(),
  rateToBase: z.string().trim().optional().nullable(),
});

const settingsFormSchema = z.object({
  baseCurrencyCode: z.string().trim().min(3).max(3),
  siteCurrencyCode: z.string().trim().min(3).max(3),
  allowBuyerCurrencySwitch: z.boolean(),
  currencyDisplayMode: z.enum(["CODE", "SYMBOL"]),
});

function formBool(formData: FormData, key: string): boolean {
  const raw = formData.get(key);
  return raw === "on" || raw === "true" || raw === "1";
}

function mapFinanceError(error: unknown): string {
  const code = error instanceof Error ? error.message : "UNKNOWN";
  switch (code) {
    case "CURRENCY_DUPLICATE":
      return "CURRENCY_DUPLICATE";
    case "UNKNOWN_ISO_CURRENCY":
      return "UNKNOWN_ISO_CURRENCY";
    case "CURRENCY_NOT_FOUND":
      return "CURRENCY_NOT_FOUND";
    case "CANNOT_DISABLE_PROTECTED_CURRENCY":
      return "CANNOT_DISABLE_PROTECTED_CURRENCY";
    case "SITE_CURRENCY_MUST_BE_BUYER_VISIBLE":
      return "SITE_CURRENCY_MUST_BE_BUYER_VISIBLE";
    case "CURRENCY_INACTIVE":
      return "CURRENCY_INACTIVE";
    case "INVALID_RATE":
      return "INVALID_RATE";
    case "CANNOT_DELETE_PROTECTED_CURRENCY":
      return "CANNOT_DELETE_PROTECTED_CURRENCY";
    case "CURRENCY_IN_USE":
      return "CURRENCY_IN_USE";
    case "ROOT_REQUIRED":
      return "ROOT_REQUIRED";
    default:
      return "SAVE_FAILED";
  }
}

const DELETE_ERROR_KEYS = {
  CURRENCY_NOT_FOUND: "errorCURRENCY_NOT_FOUND",
  CANNOT_DELETE_PROTECTED_CURRENCY: "errorCANNOT_DELETE_PROTECTED_CURRENCY",
  CURRENCY_IN_USE: "errorCURRENCY_IN_USE",
  SAVE_FAILED: "errorSAVE_FAILED",
} as const;

export async function deleteCurrencyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await getAdminUser();
  const t = await getTranslations("FinanceAdmin");
  const code = String(formData.get("code") ?? "").trim();
  if (!/^[A-Za-z]{3}$/.test(code)) {
    return { ok: false, message: t("errorVALIDATION") };
  }
  try {
    await deleteCurrency(code);
    revalidatePath("/admin/finance");
    revalidatePath("/");
    return { ok: true, message: t("toastDeleted") };
  } catch (error) {
    const mapped = mapFinanceError(error);
    const key =
      DELETE_ERROR_KEYS[mapped as keyof typeof DELETE_ERROR_KEYS] ??
      "errorSAVE_FAILED";
    return { ok: false, message: t(key) };
  }
}

export async function createCurrencyAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const parsed = currencyFormSchema.safeParse({
    code: formData.get("code"),
    isActive: formBool(formData, "isActive"),
    isBuyerVisible: formBool(formData, "isBuyerVisible"),
    rateToBase: formData.get("rateToBase"),
  });
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await createCurrencyFromIso({
      code: parsed.data.code,
      isActive: parsed.data.isActive,
      isBuyerVisible: parsed.data.isBuyerVisible,
      rateToBase: parsed.data.rateToBase || null,
    });
    revalidatePath("/admin/finance");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}

export async function updateCurrencyAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const parsed = currencyFormSchema.safeParse({
    code: formData.get("code"),
    isActive: formBool(formData, "isActive"),
    isBuyerVisible: formBool(formData, "isBuyerVisible"),
    rateToBase: formData.get("rateToBase"),
  });
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await updateCurrency({
      code: parsed.data.code,
      isActive: parsed.data.isActive,
      isBuyerVisible: parsed.data.isBuyerVisible,
      rateToBase: parsed.data.rateToBase || null,
    });
    revalidatePath("/admin/finance");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}

export async function updateFinanceSettingsAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const parsed = settingsFormSchema.safeParse({
    baseCurrencyCode: formData.get("baseCurrencyCode"),
    siteCurrencyCode: formData.get("siteCurrencyCode"),
    allowBuyerCurrencySwitch: formBool(formData, "allowBuyerCurrencySwitch"),
    currencyDisplayMode: formData.get("currencyDisplayMode") || "CODE",
  });
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await updateFinanceSettings(parsed.data);
    revalidatePath("/admin/finance");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}

const rootPricingFormSchema = z.object({
  taxonomyNodeId: z.string().trim().min(1),
  vatEnabled: z.boolean(),
  vatSumsEnabled: z.boolean(),
  entryMode: z.enum(["INCL_VAT", "EXCL_VAT"]),
  storefrontPriceMode: z.enum(["INCL_VAT", "EXCL_VAT"]),
  vatPercent: z.coerce.number().min(0).max(100),
  showPriceWithVat: z.boolean(),
  showPriceWithoutVat: z.boolean(),
  showVatAmount: z.boolean(),
  displayMode: z.enum(["SINGLE", "STACKED"]),
  mainCurrencyCode: z.string().trim().min(3).max(3),
  vatDisplayCurrencyCode: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .nullable()
    .optional(),
  allowBuyerCurrencySwitch: z.boolean(),
  extraCurrencyCodes: z.array(z.string().trim().min(3).max(3)),
});

export async function upsertRootPricingAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const extras = formData
    .getAll("extraCurrencyCodes")
    .map((value) => String(value).trim().toUpperCase())
    .filter(Boolean);
  const vatDisplayRaw = String(
    formData.get("vatDisplayCurrencyCode") ?? ""
  )
    .trim()
    .toUpperCase();
  const parsed = rootPricingFormSchema.safeParse({
    taxonomyNodeId: formData.get("taxonomyNodeId"),
    vatEnabled: formBool(formData, "vatEnabled"),
    vatSumsEnabled: formBool(formData, "vatSumsEnabled"),
    entryMode: formData.get("entryMode"),
    storefrontPriceMode: formData.get("storefrontPriceMode"),
    vatPercent: formData.get("vatPercent"),
    showPriceWithVat: formBool(formData, "showPriceWithVat"),
    showPriceWithoutVat: formBool(formData, "showPriceWithoutVat"),
    showVatAmount: formBool(formData, "showVatAmount"),
    displayMode: formData.get("displayMode"),
    mainCurrencyCode: formData.get("mainCurrencyCode"),
    vatDisplayCurrencyCode: vatDisplayRaw || null,
    allowBuyerCurrencySwitch: formBool(formData, "allowBuyerCurrencySwitch"),
    extraCurrencyCodes: extras,
  });
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await upsertRootPricing({
      ...parsed.data,
      taxonomyNodeId: parsed.data.taxonomyNodeId as string | "ALL",
      vatDisplayCurrencyCode: parsed.data.vatDisplayCurrencyCode ?? null,
    });
    revalidatePath("/admin/finance");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}

const presetSchema = z.object({
  annualRatePercent: z.coerce.number().min(0).max(100),
  termMonthsMin: z.coerce.number().int().min(1).max(120),
  termMonthsMax: z.coerce.number().int().min(1).max(120),
  termMonthsDefault: z.coerce.number().int().min(1).max(120),
  termMonthsStep: z.coerce.number().min(1).max(120),
  downPaymentPercentMin: z.coerce.number().min(0).max(100),
  downPaymentPercentMax: z.coerce.number().min(0).max(100),
  downPaymentPercentDefault: z.coerce.number().min(0).max(100),
  downPaymentPercentStep: z.coerce.number().gt(0).max(100),
  residualPercent: z.coerce.number().min(0).max(100).nullable(),
});

export async function saveRootFinancingAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const readPreset = (prefix: string, withResidual: boolean) =>
    presetSchema.safeParse({
      annualRatePercent: formData.get(`${prefix}AnnualRatePercent`),
      termMonthsMin: formData.get(`${prefix}TermMonthsMin`),
      termMonthsMax: formData.get(`${prefix}TermMonthsMax`),
      termMonthsDefault: formData.get(`${prefix}TermMonthsDefault`),
      termMonthsStep: formData.get(`${prefix}TermMonthsStep`),
      downPaymentPercentMin: formData.get(`${prefix}DownPaymentPercentMin`),
      downPaymentPercentMax: formData.get(`${prefix}DownPaymentPercentMax`),
      downPaymentPercentDefault: formData.get(
        `${prefix}DownPaymentPercentDefault`
      ),
      downPaymentPercentStep: formData.get(`${prefix}DownPaymentPercentStep`),
      residualPercent: withResidual
        ? formData.get(`${prefix}ResidualPercent`)
        : null,
    });
  const credit = readPreset("credit", false);
  const lease = readPreset("lease", true);
  const taxonomyNodeId = String(formData.get("taxonomyNodeId") ?? "").trim();
  if (!credit.success || !lease.success || !taxonomyNodeId) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await saveRootFinancing({
      taxonomyNodeId: taxonomyNodeId as string | "ALL",
      financingEnabled: formBool(formData, "financingEnabled"),
      financingFacts: {
        down: formBool(formData, "financingShowDown"),
        residual: formBool(formData, "financingShowResidual"),
        total: formBool(formData, "financingShowTotal"),
        rate: formBool(formData, "financingShowRate"),
      },
      credit: credit.data,
      lease: lease.data,
    });
    revalidatePath("/admin/finance");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}

export async function setRootFinancingEnabledAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await getAdminUser();
  const taxonomyNodeId = String(formData.get("taxonomyNodeId") ?? "").trim();
  if (!taxonomyNodeId) {
    return { ok: false, error: "VALIDATION" };
  }
  try {
    await setRootFinancingEnabled(
      taxonomyNodeId as string | "ALL",
      formBool(formData, "financingEnabled")
    );
    revalidatePath("/admin/finance");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapFinanceError(error) };
  }
}
