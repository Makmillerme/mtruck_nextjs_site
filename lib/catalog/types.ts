export const ATTRIBUTE_TYPES = [
  "SELECT",
  "NUMBER",
  "TEXT",
  "BOOLEAN",
  "YEAR",
] as const;

export type AttributeTypeName = (typeof ATTRIBUTE_TYPES)[number];

export type TaxonomyNodeRow = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type TaxonomyTreeNode = TaxonomyNodeRow & {
  children: TaxonomyTreeNode[];
  productCount: number;
  attributeCount: number;
  /** Whole branch, including this node. */
  subtreeProductCount: number;
  subtreeAttributeCount: number;
  descendantCount: number;
};

export type SubtreeStats = {
  descendantCount: number;
  attributeCount: number;
  productCount: number;
};

export type AttributeOptionRow = {
  id: string;
  attributeId: string;
  parentOptionId: string | null;
  label: string;
  slug: string;
  sortOrder: number;
};

export type AttributeSource = {
  id: string;
  name: string;
};

export type CatalogAttribute = {
  id: string;
  taxonomyNodeId: string;
  key: string;
  name: string;
  type: AttributeTypeName;
  dependsOnAttributeId: string | null;
  dependsOn: { id: string; name: string; key: string } | null;
  isRequired: boolean;
  isFacet: boolean;
  isIdentity: boolean;
  unit: string | null;
  sortOrder: number;
  source: AttributeSource;
  inherited: boolean;
  options: AttributeOptionRow[];
};
