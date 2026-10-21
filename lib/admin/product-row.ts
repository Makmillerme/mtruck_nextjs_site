import type { AttributeType, Prisma } from "@prisma/client";

/** Shared admin product row (list + soft-save payload + sheet hydrate). */
export type AdminProductSpecDTO = {
  attributeId: string;
  optionId: string | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
  optionLabel?: string | null;
  optionSlug?: string | null;
  attributeKey?: string | null;
  unit?: string | null;
  type?: AttributeType | null;
};

export type AdminProductRowDTO = {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  availability: string;
  description: string;
  image: string;
  images: { id: string; url: string }[];
  taxonomyNodeId: string | null;
  specs: AdminProductSpecDTO[];
};

export const adminProductListInclude = {
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, sortOrder: true },
  },
  specs: {
    include: {
      option: { select: { id: true, label: true, slug: true } },
      attribute: {
        select: { id: true, key: true, name: true, type: true, unit: true },
      },
    },
  },
} satisfies Prisma.ProductInclude;

/** Slim list: specs for table/filter/search, no gallery payload. */
export const adminProductSlimInclude = {
  specs: {
    include: {
      option: { select: { id: true, label: true, slug: true } },
      attribute: {
        select: { id: true, key: true, type: true, unit: true },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type ProductWithAdminRelations = Prisma.ProductGetPayload<{
  include: typeof adminProductListInclude;
}>;

type ProductWithSlimRelations = Prisma.ProductGetPayload<{
  include: typeof adminProductSlimInclude;
}>;

function mapSpecs(
  specs: ProductWithAdminRelations["specs"] | ProductWithSlimRelations["specs"]
): AdminProductSpecDTO[] {
  return specs.map((spec) => ({
    attributeId: spec.attributeId,
    optionId: spec.optionId,
    numberValue: spec.numberValue,
    textValue: spec.textValue,
    booleanValue: spec.booleanValue,
    optionLabel: spec.option?.label ?? null,
    optionSlug: spec.option?.slug ?? null,
    attributeKey: spec.attribute?.key ?? null,
    unit: spec.attribute?.unit ?? null,
    type: spec.attribute?.type ?? null,
  }));
}

export function mapAdminProductRow(
  product: ProductWithAdminRelations
): AdminProductRowDTO {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    status: product.status,
    availability: product.availability,
    description: product.description,
    image: product.image,
    images: product.images.map((image) => ({ id: image.id, url: image.url })),
    taxonomyNodeId: product.taxonomyNodeId,
    specs: mapSpecs(product.specs),
  };
}

export function mapAdminProductSlimRow(
  product: ProductWithSlimRelations
): AdminProductRowDTO {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    status: product.status,
    availability: product.availability,
    description: "",
    image: product.image,
    images: [],
    taxonomyNodeId: product.taxonomyNodeId,
    specs: mapSpecs(product.specs),
  };
}
