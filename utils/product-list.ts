export const productListSelect = {
  id: true,
  name: true,
  company: true,
  featured: true,
  image: true,
  price: true,
  createdAt: true,
} as const;

export type ProductListItem = {
  id: string;
  name: string;
  company: string;
  featured: boolean;
  image: string;
  price: number;
  createdAt: Date;
};
