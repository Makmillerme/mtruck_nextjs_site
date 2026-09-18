export type actionFunction = (
  prevState: { message: string },
  formData: FormData
) => Promise<{ message: string }>;
