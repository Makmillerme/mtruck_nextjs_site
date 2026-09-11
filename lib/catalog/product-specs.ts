import {
  fetchAttributesForNode,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { specInputName, sortByDependency } from "./spec-fields";

export { specInputName, sortByDependency } from "./spec-fields";

export type SpecCreateInput = {
  attributeId: string;
  optionId?: string | null;
  numberValue?: number | null;
  textValue?: string | null;
  booleanValue?: boolean | null;
};

export async function specsFromFormData(nodeId: string, formData: FormData) {
  const t = await getTranslations("CatalogAdmin");
  const attributes = resolveAttributesByKey(await fetchAttributesForNode(nodeId));
  const specs: SpecCreateInput[] = [];
  const chosenOptions: Record<string, string> = {};
  let companyFromIdentity: string | null = null;

  for (const attribute of sortByDependency(attributes)) {
    if (attribute.type === "SELECT") {
      const raw = String(
        formData.get(specInputName("option", attribute.id)) ?? ""
      ).trim();
      if (!raw) {
        if (attribute.isRequired) {
          throw new Error(t("specRequired", { field: attribute.name }));
        }
        continue;
      }
      const option = attribute.options.find((item) => item.id === raw);
      if (!option) throw new Error(t("specInvalid", { field: attribute.name }));
      if (attribute.dependsOnAttributeId) {
        const parentId = chosenOptions[attribute.dependsOnAttributeId];
        if (!parentId || option.parentOptionId !== parentId) {
          throw new Error(t("specCascade", { field: attribute.name }));
        }
      }
      chosenOptions[attribute.id] = option.id;
      specs.push({ attributeId: attribute.id, optionId: option.id });
      if (attribute.isIdentity && !companyFromIdentity) {
        companyFromIdentity = option.label;
      }
      continue;
    }

    if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
      const raw = String(
        formData.get(specInputName("number", attribute.id)) ?? ""
      ).trim();
      if (!raw) {
        if (attribute.isRequired) {
          throw new Error(t("specRequired", { field: attribute.name }));
        }
        continue;
      }
      const numberValue = Number(raw);
      if (!Number.isFinite(numberValue)) {
        throw new Error(t("specInvalid", { field: attribute.name }));
      }
      if (attribute.type === "YEAR" && (numberValue < 1970 || numberValue > 2100)) {
        throw new Error(t("specInvalid", { field: attribute.name }));
      }
      specs.push({ attributeId: attribute.id, numberValue });
      continue;
    }

    if (attribute.type === "TEXT") {
      const textValue = String(
        formData.get(specInputName("text", attribute.id)) ?? ""
      ).trim();
      if (!textValue) {
        if (attribute.isRequired) {
          throw new Error(t("specRequired", { field: attribute.name }));
        }
        continue;
      }
      specs.push({ attributeId: attribute.id, textValue });
      continue;
    }

    const booleanValue =
      formData.get(specInputName("bool", attribute.id)) === "true" ||
      formData.get(specInputName("bool", attribute.id)) === "on";
    specs.push({ attributeId: attribute.id, booleanValue });
  }

  return { specs, companyFromIdentity, attributes };
}



export function toPrismaSpecCreates(
  specs: SpecCreateInput[]
): Prisma.ProductSpecCreateWithoutProductInput[] {
  return specs.map((spec) => ({
    attribute: { connect: { id: spec.attributeId } },
    option: spec.optionId ? { connect: { id: spec.optionId } } : undefined,
    numberValue: spec.numberValue ?? undefined,
    textValue: spec.textValue ?? undefined,
    booleanValue: spec.booleanValue ?? undefined,
  }));
}
