export type TaxonomyActionState = {
  message: string;
  ok?: boolean;
};

export type TaxonomyAction = (
  prevState: TaxonomyActionState,
  formData: FormData
) => Promise<TaxonomyActionState>;

export const initialTaxonomyActionState: TaxonomyActionState = { message: "" };
