'use server';

import db from '@/utils/db';
import {
  getAuthUser,
  getSession,
  getStaffUser,
  getUserRole,
  isAdminRole,
  isStaffRole,
  requireAdminMutation,
} from '@/utils/session';
import { redirect } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  imageSchema,
  callbackInquirySchema,
  changePasswordSchema,
  partnershipInquirySchema,
  adminOrderSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userRequestOrderSchema,
  productSchema,
  reviewSchema,
  updateAccountProfileSchema,
  validateWithZodSchema,
} from './schemas';
import {
  deleteAvatarImage,
  deleteImage,
  deleteImages,
  PRODUCT_IMAGE_MAX,
  uploadAvatarImage,
  uploadImage,
  uploadProductImages,
} from './images';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { CatalogQuery, CatalogSort } from '@/utils/catalog-query';
import { catalogQueryToWhere } from '@/lib/catalog/public-filter';
import { productListSelect } from '@/utils/product-list';
import {
  specsFromFormData,
  toPrismaSpecCreates,
} from '@/lib/catalog/product-specs';
import { resolveProductNameFromDisplayGroups } from '@/lib/catalog/display-group';
import type { ProductAvailability, ProductStatus } from '@prisma/client';
const renderError = async (error: unknown): Promise<{ message: string }> => {
  console.error(error);
  const t = await getTranslations('Actions');
  return {
    message: t('error'),
  };
};

async function redirectLocalized(
  href:
    | "/"
    | "/products"
    | "/admin/products"
    | "/admin/sales"
    | "/admin/users"
    | "/account/orders"
): Promise<never> {
  const locale = await getLocale();
  redirect({ href, locale });
  throw new Error("Redirect failed");
}

export const fetchFeaturedProducts = async (take = 6) => {
  return db.product.findMany({
    where: {
      featured: true,
      status: "PUBLISHED",
      archivedAt: null,
    },
    select: productListSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
};

export const fetchAllProducts = async ({
  search = "",
  sort = "newest",
  featuredOnly = false,
  folders = [],
  facets = {},
  ranges = {},
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  sort?: CatalogSort;
  featuredOnly?: boolean;
  folders?: string[];
  facets?: CatalogQuery["facets"];
  ranges?: CatalogQuery["ranges"];
  page?: number;
  pageSize?: number;
}) => {
  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const and = await catalogQueryToWhere({
    search,
    featuredOnly,
    folders,
    facets,
    ranges,
  });

  const where = { AND: and };
  const skip = Math.max(0, (page - 1) * pageSize);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productListSelect,
      orderBy,
      skip,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return { products, total };
};

export const fetchUserFavoriteIds = async () => {
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) {
    return { isAuthenticated: false as const, favoriteByProductId: new Map<string, string>() };
  }
  const rows = await db.favorite.findMany({
    where: { userId },
    select: { id: true, productId: true },
  });
  return {
    isAuthenticated: true as const,
    favoriteByProductId: new Map(rows.map((row) => [row.productId, row.id])),
  };
};

export const fetchProductBrands = async () => {
  const rows = await db.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
    distinct: ["company"],
    select: { company: true },
    orderBy: { company: "asc" },
  });
  return rows
    .filter((row) => Boolean(row.company))
    .map((row) => row.company);
};

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      taxonomyNode: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      specs: {
        include: {
          attribute: {
            select: {
              id: true,
              key: true,
              name: true,
              unit: true,
              sortOrder: true,
              type: true,
            },
          },
          option: { select: { id: true, label: true, slug: true } },
        },
        orderBy: { attribute: { sortOrder: 'asc' } },
      },
    },
  });
  if (!product || product.archivedAt) {
    return redirectLocalized('/products');
  }
  return product;
};

const PRODUCT_STATUSES: ProductStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'RESERVED',
  'PREPARING',
  'SOLD',
];
const PRODUCT_AVAILABILITIES: ProductAvailability[] = ['IN_STOCK', 'TRANSIT'];

export const createProductAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const { user } = await getStaffUser();
  try {
    const rawData = Object.fromEntries(formData);
    const taxonomyNodeId = String(formData.get('taxonomyNodeId') ?? '').trim();
    let specCreates: ReturnType<typeof toPrismaSpecCreates> = [];
    if (taxonomyNodeId) {
      const node = await db.taxonomyNode.findUnique({
        where: { id: taxonomyNodeId },
        select: { id: true },
      });
      if (!node) {
        const catalogT = await getTranslations('CatalogAdmin');
        throw new Error(catalogT('parentMissing'));
      }
      const parsed = await specsFromFormData(taxonomyNodeId, formData);
      specCreates = toPrismaSpecCreates(parsed.specs);
      if (parsed.companyFromIdentity && !String(rawData.company ?? '').trim()) {
        rawData.company = parsed.companyFromIdentity;
      }
      const composedName = await resolveProductNameFromDisplayGroups(
        taxonomyNodeId,
        parsed.specs
      );
      if (composedName) {
        rawData.name = composedName;
      }
    }
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const files = formData
      .getAll('images')
      .filter((item): item is File => item instanceof File && item.size > 0);
    const legacy = formData.get('image');
    if (legacy instanceof File && legacy.size > 0 && files.length === 0) {
      files.push(legacy);
    }
    if (files.length === 0) {
      throw new Error('At least one image is required');
    }
    if (files.length > PRODUCT_IMAGE_MAX) {
      throw new Error(`Maximum ${PRODUCT_IMAGE_MAX} images allowed`);
    }
    for (const file of files) {
      validateWithZodSchema(imageSchema, { image: file });
    }
    const imageUrls = await uploadProductImages(files);
    const cover = imageUrls[0]!;
    const statusRaw = String(formData.get('status') ?? 'PUBLISHED');
    const availabilityRaw = String(formData.get('availability') ?? 'IN_STOCK');
    const status = PRODUCT_STATUSES.includes(statusRaw as ProductStatus)
      ? (statusRaw as ProductStatus)
      : 'PUBLISHED';
    const availability = PRODUCT_AVAILABILITIES.includes(
      availabilityRaw as ProductAvailability
    )
      ? (availabilityRaw as ProductAvailability)
      : 'IN_STOCK';

    const { generateUniqueProductCode } = await import("@/lib/codes");
    const productCode = await generateUniqueProductCode();
    await db.product.create({
      data: {
        ...validatedFields,
        image: cover,
        productCode,
        userId: user.id,
        taxonomyNodeId: taxonomyNodeId || null,
        status,
        availability,
        specs: specCreates.length ? { create: specCreates } : undefined,
        images: {
          create: imageUrls.map((url, sortOrder) => ({ url, sortOrder })),
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/products');
};

export const fetchAdminProducts = async () => {
  await getStaffUser();
  const products = await db.product.findMany({
    where: { archivedAt: null },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      specs: {
        include: {
          option: { select: { id: true, label: true } },
          attribute: {
            select: { id: true, key: true, name: true, type: true, unit: true },
          },
        },
      },
    },
  });
  return products;
};

export const archiveProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  try {
    await requireAdminMutation();
    await db.product.update({
      where: { id: productId },
      data: { archivedAt: new Date() },
    });
    revalidatePath('/admin/products');
    revalidatePath('/admin/archive');
    revalidatePath('/products');
    const t = await getTranslations('Actions');
    return { message: t('productArchived') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const restoreProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  try {
    await requireAdminMutation();
    await db.product.update({
      where: { id: productId },
      data: { archivedAt: null },
    });
    revalidatePath('/admin/products');
    revalidatePath('/admin/archive');
    revalidatePath('/products');
    const t = await getTranslations('Actions');
    return { message: t('productRestored') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  try {
    await requireAdminMutation();
    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, image: true, archivedAt: true },
    });
    if (!existing?.archivedAt) {
      const t = await getTranslations('Admin');
      throw new Error(t('deleteOnlyFromArchive'));
    }
    const gallery = await db.productImage.findMany({
      where: { productId },
      select: { url: true },
    });
    const product = await db.product.delete({
      where: { id: productId },
    });
    const urls = new Set([product.image, ...gallery.map((item) => item.url)]);
    await deleteImages([...urls]);
    revalidatePath('/admin/products');
    revalidatePath('/admin/archive');
    revalidatePath('/products');
    const t = await getTranslations('Actions');
    return { message: t('productRemoved') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const fetchAdminProductDetails = async (productId: string) => {
  await getStaffUser();
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!product) return redirectLocalized('/admin/products');
  return product;
};

export const updateProductAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  await getStaffUser();
  try {
    const productId = String(formData.get('id') ?? '').trim();
    if (!productId) {
      throw new Error('Product id is required');
    }
    const existing = await db.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!existing) {
      const t = await getTranslations('Actions');
      return { message: t('error') };
    }

    const rawData = Object.fromEntries(formData);
    const taxonomyNodeId = String(formData.get('taxonomyNodeId') ?? '').trim();
    let specCreates: ReturnType<typeof toPrismaSpecCreates> = [];
    if (taxonomyNodeId) {
      const node = await db.taxonomyNode.findUnique({
        where: { id: taxonomyNodeId },
        select: { id: true },
      });
      if (!node) {
        const catalogT = await getTranslations('CatalogAdmin');
        throw new Error(catalogT('parentMissing'));
      }
      const parsed = await specsFromFormData(taxonomyNodeId, formData);
      specCreates = toPrismaSpecCreates(parsed.specs);
      if (parsed.companyFromIdentity && !String(rawData.company ?? '').trim()) {
        rawData.company = parsed.companyFromIdentity;
      }
      const composedName = await resolveProductNameFromDisplayGroups(
        taxonomyNodeId,
        parsed.specs
      );
      if (composedName) {
        rawData.name = composedName;
      }
    }
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const statusRaw = String(formData.get('status') ?? existing.status);
    const availabilityRaw = String(
      formData.get('availability') ?? existing.availability
    );
    const status = PRODUCT_STATUSES.includes(statusRaw as ProductStatus)
      ? (statusRaw as ProductStatus)
      : existing.status;
    const availability = PRODUCT_AVAILABILITIES.includes(
      availabilityRaw as ProductAvailability
    )
      ? (availabilityRaw as ProductAvailability)
      : existing.availability;

    const files = formData
      .getAll('images')
      .filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length + existing.images.length > PRODUCT_IMAGE_MAX) {
      throw new Error(`Maximum ${PRODUCT_IMAGE_MAX} images allowed`);
    }
    for (const file of files) {
      validateWithZodSchema(imageSchema, { image: file });
    }
    const newUrls = files.length ? await uploadProductImages(files) : [];
    const cover = existing.image || newUrls[0] || existing.image;
    const startOrder = existing.images.length;

    await db.product.update({
      where: { id: productId },
      data: {
        ...validatedFields,
        image: cover,
        taxonomyNodeId: taxonomyNodeId || null,
        status,
        availability,
        specs: {
          deleteMany: {},
          create: specCreates,
        },
        images:
          newUrls.length > 0
            ? {
                create: newUrls.map((url, index) => ({
                  url,
                  sortOrder: startOrder + index,
                })),
              }
            : undefined,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/products');
};
export const updateProductImageAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  await getStaffUser();
  try {
    const image = formData.get('image') as File;
    const productId = formData.get('id') as string;
    const oldImageUrl = formData.get('url') as string;

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) {
      const t = await getTranslations('Actions');
      return { message: t('error') };
    }

    const validatedFile = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFile.image);
    await deleteImage(oldImageUrl);
    const firstGallery = product.images[0];
    await db.$transaction([
      db.product.update({
        where: { id: productId },
        data: { image: fullPath },
      }),
      firstGallery
        ? db.productImage.update({
            where: { id: firstGallery.id },
            data: { url: fullPath },
          })
        : db.productImage.create({
            data: { productId, url: fullPath, sortOrder: 0 },
          }),
    ]);
    revalidatePath(`/admin/products/${productId}/edit`);
    const t = await getTranslations('Actions');
    return { message: t('imageUpdated') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) return null;
  const favorite = await db.favorite.findFirst({
    where: {
      productId,
      userId,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState: {
  productId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { productId, favoriteId, pathname } = prevState;

  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          productId,
          userId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    const t = await getTranslations('Actions');
    return {
      message: favoriteId ? t('removedFromFavorites') : t('addedToFavorites'),
    };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchUserFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      userId: user.id,
      product: { archivedAt: null },
    },
    include: {
      product: { select: productListSelect },
    },
  });
  return favorites;
};

export const createReviewAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(reviewSchema, rawData);
    const existing = await db.review.findFirst({
      where: {
        userId: user.id,
        productId: validatedFields.productId,
      },
      select: { id: true },
    });
    if (existing) {
      const t = await getTranslations('Actions');
      return { message: t('reviewAlreadyExists') };
    }
    await db.review.create({
      data: {
        ...validatedFields,
        authorImageUrl: validatedFields.authorImageUrl || user.image || '',
        userId: user.id,
      },
    });
    revalidatePath(`/products/${validatedFields.productId}`);
    const t = await getTranslations('Actions');
    return { message: t('reviewSubmitted') };
  } catch (error) {
    return renderError(error);
  }
};

export const submitPartnershipInquiryAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  try {
    validateWithZodSchema(partnershipInquirySchema, {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
    });
    const t = await getTranslations('Actions');
    return { message: t('partnershipSubmitted') };
  } catch (error) {
    return renderError(error);
  }
};

export const submitCallbackInquiryAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  try {
    validateWithZodSchema(callbackInquirySchema, {
      phone: formData.get('phone'),
    });
    const t = await getTranslations('Actions');
    return { message: t('callbackSubmitted') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchProductReviews = async (productId: string) => {
  const reviews = await db.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return reviews;
};
export const fetchProductRating = async (productId: string) => {
  const result = await db.review.groupBy({
    by: ['productId'],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: { productId },
  });
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
};

export const fetchProductReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      product: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });
  return reviews;
};
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();
  try {
    await db.review.delete({
      where: {
        id: reviewId,
        userId: user.id,
      },
    });
    revalidatePath('/reviews');
    const t = await getTranslations('Actions');
    return { message: t('reviewDeleted') };
  } catch (error) {
    return renderError(error);
  }
};
export const findExistingReview = async (userId: string, productId: string) => {
  return db.review.findFirst({
    where: {
      userId: userId,
      productId,
    },
  });
};

const fetchProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export const createCatalogOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const productId = String(formData.get('productId') ?? '').trim();
    if (!productId) {
      throw new Error('Product id is required');
    }
    const product = await fetchProduct(productId);
    const openOrder = await db.order.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        kind: 'CATALOG',
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
      select: { id: true },
    });
    if (openOrder) {
      const t = await getTranslations('Actions');
      return { message: t('orderAlreadyOpen') };
    }
    await db.order.create({
      data: {
        userId: user.id,
        email: user.email,
        kind: 'CATALOG',
        status: 'NEW',
        origin: 'USER',
        productId: product.id,
        products: 1,
        orderTotal: product.price,
        tax: 0,
        shipping: 0,
        isPaid: false,
      },
    });
    revalidatePath('/account/orders');
    revalidatePath('/admin/sales');
  } catch (error) {
    return renderError(error);
  }
  return redirectLocalized('/account/orders');
};

export const fetchUserOrders = async () => {
  const user = await getAuthUser();
  const orders = await db.order.findMany({
    where: {
      userId: user.id,
      archivedAt: null,
    },
    include: {
      product: {
        select: { id: true, name: true, company: true },
      },
      taxonomyNode: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return orders;
};

export const createUserRequestOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const data = validateWithZodSchema(
      userRequestOrderSchema,
      Object.fromEntries(formData)
    );
    const node = await db.taxonomyNode.findUnique({
      where: { id: data.taxonomyNodeId },
      select: { id: true },
    });
    if (!node) {
      throw new Error('Folder not found');
    }
    await db.order.create({
      data: {
        userId: user.id,
        email: user.email,
        kind: 'REQUEST',
        status: 'NEW',
        origin: 'USER',
        taxonomyNodeId: node.id,
        note: data.note || null,
        productId: null,
        products: 1,
        orderTotal: 0,
        tax: 0,
        shipping: 0,
        isPaid: false,
      },
    });
    revalidatePath('/account/orders');
    revalidatePath('/admin/sales');
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/account/orders');
};

export const updateUserOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const orderId = String(formData.get('orderId') ?? '').trim();
    if (!orderId) {
      throw new Error('Order id is required');
    }
    const existing = await db.order.findFirst({
      where: { id: orderId, userId: user.id },
    });
    if (!existing) {
      throw new Error('Order not found');
    }
    if (existing.status !== 'NEW') {
      const t = await getTranslations('Actions');
      return { message: t('orderLocked') };
    }
    const note = String(formData.get('note') ?? '').trim().slice(0, 2000);
    if (existing.kind === 'REQUEST') {
      const data = validateWithZodSchema(
        userRequestOrderSchema,
        Object.fromEntries(formData)
      );
      const node = await db.taxonomyNode.findUnique({
        where: { id: data.taxonomyNodeId },
        select: { id: true },
      });
      if (!node) {
        throw new Error('Folder not found');
      }
      await db.order.update({
        where: { id: existing.id },
        data: {
          taxonomyNodeId: node.id,
          note: data.note || null,
        },
      });
    } else {
      await db.order.update({
        where: { id: existing.id },
        data: { note: note || null },
      });
    }
    revalidatePath('/account/orders');
    revalidatePath('/admin/sales');
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/account/orders');
};

export const deleteUserOrderAction = async (prevState: {
  orderId: string;
}) => {
  const user = await getAuthUser();
  const { orderId } = prevState;
  try {
    const existing = await db.order.findFirst({
      where: { id: orderId, userId: user.id },
      select: { id: true, status: true },
    });
    if (!existing) {
      throw new Error('Order not found');
    }
    if (existing.status !== 'NEW') {
      const t = await getTranslations('Actions');
      return { message: t('orderLocked') };
    }
    await db.order.delete({ where: { id: existing.id } });
    revalidatePath('/account/orders');
    revalidatePath('/admin/sales');
    const t = await getTranslations('Actions');
    return { message: t('orderRemoved') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAdminOrders = async () => {
  await getStaffUser();

  const orders = await db.order.findMany({
    where: { archivedAt: null },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      product: {
        select: { id: true, name: true, company: true, price: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return orders;
};

export const fetchAdminOrderFormOptions = async () => {
  const { role: actorRole } = await getStaffUser();
  const [users, products] = await Promise.all([
    db.user.findMany({
      where: {
        archivedAt: null,
        ...(isAdminRole(actorRole) ? {} : { role: { not: 'ADMIN' as const } }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userCode: true,
      },
      orderBy: { email: 'asc' },
    }),
    db.product.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        name: true,
        company: true,
        price: true,
        productCode: true,
        status: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);
  return { users, products };
};

export const createAdminOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  await getStaffUser();
  try {
    const raw = Object.fromEntries(formData);
    const data = validateWithZodSchema(adminOrderSchema, {
      ...raw,
      isPaid: formData.get('isPaid') === 'on',
    });
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, archivedAt: true },
    });
    if (!user || user.archivedAt) {
      throw new Error('User not found');
    }
    let productId: string | null = data.productId || null;
    let orderTotal = data.orderTotal;
    let productsCount = data.products;
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true, price: true },
      });
      if (!product) {
        throw new Error('Product not found');
      }
      if (!orderTotal) {
        orderTotal = product.price;
      }
      if (!productsCount) {
        productsCount = 1;
      }
    } else {
      productId = null;
    }
    await db.order.create({
      data: {
        userId: user.id,
        email: user.email,
        kind: 'CATALOG',
        status: 'NEW',
        origin: 'ADMIN',
        productId,
        products: productsCount,
        orderTotal,
        tax: data.tax,
        shipping: data.shipping,
        isPaid: data.isPaid,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/sales');
};

export const updateAdminOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  await getStaffUser();
  try {
    const orderId = String(formData.get('orderId') ?? '').trim();
    if (!orderId) {
      throw new Error('Order id is required');
    }
    const raw = Object.fromEntries(formData);
    const data = validateWithZodSchema(adminOrderSchema, {
      ...raw,
      isPaid: formData.get('isPaid') === 'on',
    });
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, archivedAt: true },
    });
    if (!user || user.archivedAt) {
      throw new Error('User not found');
    }
    let productId: string | null = data.productId || null;
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) {
        throw new Error('Product not found');
      }
    } else {
      productId = null;
    }
    await db.order.update({
      where: { id: orderId },
      data: {
        userId: user.id,
        email: user.email,
        kind: 'CATALOG',
        productId,
        products: data.products,
        orderTotal: data.orderTotal,
        tax: data.tax,
        shipping: data.shipping,
        isPaid: data.isPaid,
      },
    });
    revalidatePath('/account/orders');
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/sales');
};

export const archiveAdminOrderAction = async (prevState: {
  orderId: string;
}) => {
  const { orderId } = prevState;
  try {
    await requireAdminMutation();
    await db.order.update({
      where: { id: orderId },
      data: { archivedAt: new Date() },
    });
    revalidatePath('/admin/sales');
    revalidatePath('/admin/archive');
    revalidatePath('/account/orders');
    const t = await getTranslations('Actions');
    return { message: t('orderArchived') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const restoreAdminOrderAction = async (prevState: {
  orderId: string;
}) => {
  const { orderId } = prevState;
  try {
    await requireAdminMutation();
    await db.order.update({
      where: { id: orderId },
      data: { archivedAt: null },
    });
    revalidatePath('/admin/sales');
    revalidatePath('/admin/archive');
    revalidatePath('/account/orders');
    const t = await getTranslations('Actions');
    return { message: t('orderRestored') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const deleteAdminOrderAction = async (prevState: {
  orderId: string;
}) => {
  const { orderId } = prevState;
  try {
    await requireAdminMutation();
    const existing = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, archivedAt: true },
    });
    if (!existing?.archivedAt) {
      const t = await getTranslations('Admin');
      throw new Error(t('deleteOnlyFromArchive'));
    }
    await db.order.delete({ where: { id: orderId } });
    revalidatePath('/admin/sales');
    revalidatePath('/admin/archive');
    revalidatePath('/account/orders');
    const t = await getTranslations('Actions');
    return { message: t('orderRemoved') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const userHasCredentialAccount = async () => {
  const user = await getAuthUser();
  const account = await db.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
    select: { id: true },
  });
  return Boolean(account);
};

export const updateAccountProfileAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const raw = Object.fromEntries(formData);
    const { name, phone } = validateWithZodSchema(
      updateAccountProfileSchema,
      raw
    );
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    });
    await db.user.update({
      where: { id: user.id },
      data: { phone: phone || null },
    });
    revalidatePath('/account');
    revalidatePath('/account/settings');
    const t = await getTranslations('Actions');
    return { message: t('profileUpdated') };
  } catch (error) {
    return renderError(error);
  }
};

export const changePasswordAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  await getAuthUser();
  try {
    const hasCredential = await userHasCredentialAccount();
    if (!hasCredential) {
      const t = await getTranslations('AccountCabinet');
      return { message: t('passwordUnavailable') };
    }
    const raw = Object.fromEntries(formData);
    const { currentPassword, newPassword } = validateWithZodSchema(
      changePasswordSchema,
      raw
    );
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });
    const t = await getTranslations('Actions');
    return { message: t('passwordUpdated') };
  } catch (error) {
    return renderError(error);
  }
};

export const updateAvatarAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const file = formData.get('image') as File;
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadAvatarImage(validatedFile.image);
    const previousImage = user.image;
    await auth.api.updateUser({
      body: { image: fullPath },
      headers: await headers(),
    });
    if (previousImage) {
      await deleteAvatarImage(previousImage);
    }
    revalidatePath('/account');
    revalidatePath('/account/settings');
    const t = await getTranslations('Actions');
    return { message: t('avatarUpdated') };
  } catch (error) {
    return renderError(error);
  }
};



export const fetchAdminUsers = async () => {
  const { role: actorRole } = await getStaffUser();
  return db.user.findMany({
    where: {
      archivedAt: null,
      ...(isAdminRole(actorRole) ? {} : { role: { not: 'ADMIN' as const } }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userCode: true,
      role: true,
      createdAt: true,
      archivedAt: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const fetchAdminUserById = async (userId: string) => {
  const { role: actorRole } = await getStaffUser();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userCode: true,
      role: true,
      createdAt: true,
      archivedAt: true,
      _count: { select: { products: true, orders: true } },
    },
  });
  if (!user) return null;
  if (!isAdminRole(actorRole) && user.role === 'ADMIN') return null;
  return user;
};

export const createAdminUserAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const { user: actor } = await getStaffUser();
  try {
    const raw = Object.fromEntries(formData);
    const data = validateWithZodSchema(adminCreateUserSchema, raw);
    const actorRole = await getUserRole(actor.id);
    const role =
      isAdminRole(actorRole) && data.role ? data.role : 'USER';
    const email = data.email.toLowerCase();
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      const t = await getTranslations('Admin');
      throw new Error(t('userEmailExists'));
    }
    const { hashPassword } = await import('better-auth/crypto');
    const { generateId } = await import('@better-auth/core/utils/id');
    const { generateUniqueUserCode } = await import('@/lib/codes');
    const userId = generateId();
    const userCode = await generateUniqueUserCode();
    const now = new Date();
    await db.user.create({
      data: {
        id: userId,
        name: data.name,
        email,
        emailVerified: false,
        phone: data.phone || null,
        userCode,
        role,
        createdAt: now,
        updatedAt: now,
        accounts: {
          create: {
            id: generateId(),
            accountId: userId,
            providerId: 'credential',
            issuer: 'local:credential',
            password: await hashPassword(data.password),
            createdAt: now,
            updatedAt: now,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/users');
};

export const updateAdminUserAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const { user: actor } = await getStaffUser();
  try {
    const raw = Object.fromEntries(formData);
    const data = validateWithZodSchema(adminUpdateUserSchema, raw);
    const actorRole = await getUserRole(actor.id);
    const email = data.email.toLowerCase();
    const clash = await db.user.findFirst({
      where: { email, NOT: { id: data.id } },
      select: { id: true },
    });
    if (clash) {
      const t = await getTranslations('Admin');
      throw new Error(t('userEmailExists'));
    }
    const existing = await db.user.findUnique({
      where: { id: data.id },
      select: { role: true },
    });
    if (!existing) {
      const t = await getTranslations('Actions');
      return { message: t('error') };
    }
    if (
      !isAdminRole(actorRole) &&
      (existing.role === 'ADMIN' || existing.role === 'MANAGER')
    ) {
      const t = await getTranslations('Admin');
      throw new Error(t('forbiddenEditStaff'));
    }
    await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email,
        phone: data.phone || null,
        role:
          isAdminRole(actorRole) && data.role ? data.role : existing.role,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
  return redirectLocalized('/admin/users');
};

async function assertUserArchiveMutationAllowed(
  userId: string,
  actorId: string
) {
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    const t = await getTranslations('Actions');
    throw new Error(t('error'));
  }
  const t = await getTranslations('Admin');
  if (target.role === 'ADMIN') {
    throw new Error(t('userArchiveAdminProtected'));
  }
  if (target.id === actorId && isStaffRole(target.role)) {
    throw new Error(t('userDeleteSelf'));
  }
}

export const archiveAdminUserAction = async (prevState: {
  userId: string;
}) => {
  const { userId } = prevState;
  try {
    const admin = await requireAdminMutation();
    await assertUserArchiveMutationAllowed(userId, admin.id);
    await db.$transaction([
      db.session.deleteMany({ where: { userId } }),
      db.user.update({
        where: { id: userId },
        data: { archivedAt: new Date() },
      }),
    ]);
    revalidatePath('/admin/users');
    revalidatePath('/admin/archive');
    revalidatePath('/admin/sales');
    const t = await getTranslations('Actions');
    return { message: t('userArchived') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const restoreAdminUserAction = async (prevState: {
  userId: string;
}) => {
  const { userId } = prevState;
  try {
    const admin = await requireAdminMutation();
    await assertUserArchiveMutationAllowed(userId, admin.id);
    await db.user.update({
      where: { id: userId },
      data: { archivedAt: null },
    });
    revalidatePath('/admin/users');
    revalidatePath('/admin/archive');
    revalidatePath('/admin/sales');
    const t = await getTranslations('Actions');
    return { message: t('userRestored') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const deleteAdminUserAction = async (prevState: {
  userId: string;
}) => {
  const { userId } = prevState;
  try {
    const admin = await requireAdminMutation();
    await assertUserArchiveMutationAllowed(userId, admin.id);
    const target = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        archivedAt: true,
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!target) {
      const t = await getTranslations('Actions');
      return { message: t('error') };
    }
    if (!target.archivedAt) {
      const t = await getTranslations('Admin');
      throw new Error(t('deleteOnlyFromArchive'));
    }
    if (target._count.products > 0 || target._count.orders > 0) {
      const t = await getTranslations('Admin');
      throw new Error(t('userDeleteHasRelations'));
    }
    await db.user.delete({ where: { id: userId } });
    revalidatePath('/admin/users');
    revalidatePath('/admin/archive');
    revalidatePath('/admin/sales');
    const t = await getTranslations('Actions');
    return { message: t('userRemoved') };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message };
    }
    return renderError(error);
  }
};

export const fetchArchivedAdminUsers = async () => {
  const { role: actorRole } = await getStaffUser();
  return db.user.findMany({
    where: {
      archivedAt: { not: null },
      ...(isAdminRole(actorRole) ? {} : { role: { not: 'ADMIN' as const } }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userCode: true,
      role: true,
      createdAt: true,
      archivedAt: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { archivedAt: 'desc' },
  });
};

export const fetchArchivedAdminProducts = async () => {
  await getStaffUser();
  return db.product.findMany({
    where: { archivedAt: { not: null } },
    orderBy: { archivedAt: 'desc' },
    select: {
      id: true,
      name: true,
      company: true,
      price: true,
      productCode: true,
      status: true,
      createdAt: true,
      archivedAt: true,
    },
  });
};

export const fetchArchivedAdminOrders = async () => {
  await getStaffUser();
  return db.order.findMany({
    where: { archivedAt: { not: null } },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      product: {
        select: { id: true, name: true, company: true, price: true },
      },
    },
    orderBy: { archivedAt: 'desc' },
  });
};
