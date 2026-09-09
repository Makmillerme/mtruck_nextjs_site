import { z, ZodSchema } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "name must be at least 2 characters.",
    })
    .max(100, {
      message: "name must be less than 100 characters.",
    }),
  company: z.string(),
  featured: z.coerce.boolean(),
  price: z.coerce.number().int().min(0, {
    message: "price must be a positive number.",
  }),
  description: z.string().refine(
    (description) => {
      const wordCount = description.split(" ").length;
      return wordCount >= 10 && wordCount <= 1000;
    },
    {
      message: "description must be between 10 and 1000 words.",
    }
  ),
});
export const imageSchema = z.object({
  image: validateImageFile(),
});

function validateImageFile() {
  const maxUploadSize = 1024 * 1024;
  return z
    .custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
      message: "Image file is required",
    })
    .refine((file) => file.size > 0 && file.size <= maxUploadSize, {
      message: "File size must be less than 1MB",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    });
}

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(","));
  }
  return result.data;
}

export const reviewSchema = z.object({
  productId: z.string().refine((value) => value !== "", {
    message: "Product ID cannot be empty",
  }),
  authorName: z.string().refine((value) => value !== "", {
    message: "Author name cannot be empty",
  }),
  authorImageUrl: z.string().optional().default(""),
  rating: z.coerce
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
  comment: z
    .string()
    .min(10, { message: "Comment must be at least 10 characters long" })
    .max(1000, { message: "Comment must be at most 1000 characters long" }),
});

export const callbackInquirySchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { message: "Enter a phone number." })
    .refine((value) => /^\+?[\d\s()-]{10,20}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
});

export const updateProfileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(80, { message: "Name must be less than 80 characters." }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(1, { message: "Confirm your new password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const partnershipInquirySchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().trim().email({ message: "Enter a valid email." }),
  company: z.string().trim().min(2, { message: "Company must be at least 2 characters." }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(2000, { message: "Message must be at most 2000 characters." }),
});
