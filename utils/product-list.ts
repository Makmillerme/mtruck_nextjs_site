export const productSpecCardSelect = {
  attribute: { select: { key: true, unit: true, name: true, sortOrder: true } },
  option: { select: { label: true } },
  numberValue: true,
  textValue: true,
  booleanValue: true,
} as const;

export const productListSelect = {
  id: true,
  name: true,
  company: true,
  featured: true,
  image: true,
  price: true,
  createdAt: true,
  status: true,
  taxonomyNode: { select: { name: true, slug: true } },
  specs: { select: productSpecCardSelect },
} as const;

export type ProductListItem = {
  id: string;
  name: string;
  company: string;
  featured: boolean;
  image: string;
  price: number;
  createdAt: Date;
  status: string;
  taxonomyNode: { name: string; slug: string } | null;
  specs: {
    attribute: { key: string; unit: string | null; name: string; sortOrder: number };
    option: { label: string } | null;
    numberValue: number | null;
    textValue: string | null;
    booleanValue: boolean | null;
  }[];
};
