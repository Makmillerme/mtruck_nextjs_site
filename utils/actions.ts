'use server';

import db from '@/utils/db';
import { getAdminUser, getAuthUser, getSession } from '@/utils/session';
import { redirect } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  imageSchema,
  callbackInquirySchema,
  changePasswordSchema,
  partnershipInquirySchema,
  adminOrderSchema,
  productSchema,
  reviewSchema,
  updateProfileNameSchema,
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
import { Cart } from '@prisma/client';
import type { CatalogSort } from '@/utils/catalog-query';
import { productListSelect } from '@/utils/product-list';
import {
  specsFromFormData,
  toPrismaSpecCreates,
} from '@/lib/catalog/product-specs';
import type { ProductAvailability, ProductStatus } from '@prisma/client';
const renderError = async (error: unknown): Promise<{ message: string }> => {
  console.error(error);
  const t = await getTranslations('Actions');
  return {
    message: t('error'),
  };
};

async function redirectLocalized(
  href: "/" | "/products" | "/admin/products" | "/admin/sales" | "/cart"
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
    },
    select: productListSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
};

export const fetchAllProducts = async ({
  search = "",
  sort = "newest",
  brands = [],
  featuredOnly = false,
}: {
  search?: string;
  sort?: CatalogSort;
  brands?: string[];
  featuredOnly?: boolean;
}) => {
  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  return db.product.findMany({
    where: {
      AND: [
        { status: "PUBLISHED" },
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        brands.length ? { company: { in: brands } } : {},
        featuredOnly ? { featured: true } : {},
      ],
    },
    select: productListSelect,
    orderBy,
  });
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
    where: { status: "PUBLISHED" },
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
  if (!product) {
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
  const user = await getAdminUser();
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

    await db.product.create({
      data: {
        ...validatedFields,
        image: cover,
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
  await getAdminUser();
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      specs: true,
    },
  });
  return products;
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();
  try {
    const gallery = await db.productImage.findMany({
      where: { productId },
      select: { url: true },
    });
    const product = await db.product.delete({
      where: {
        id: productId,
      },
    });
    const urls = new Set([product.image, ...gallery.map((item) => item.url)]);
    await deleteImages([...urls]);
    revalidatePath('/admin/products');
    const t = await getTranslations('Actions');
    return { message: t('productRemoved') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser();
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
  await getAdminUser();
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
  await getAdminUser();
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

export const fetchCartItems = async () => {
  try {
    const session = await getSession();
    const userId = session?.user.id;
    if (!userId) return 0;
    const cart = await db.cart.findFirst({
      where: { userId },
      select: {
        numItemsInCart: true,
      },
    });
    return cart?.numItemsInCart || 0;
  } catch {
    return 0;
  }
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

const includeProductClause = {
  cartItems: {
    include: {
      product: true,
    },
  },
};

export const fetchOrCreateCart = async ({
  userId,
  errorOnFailure = false,
}: {
  userId: string;
  errorOnFailure?: boolean;
}) => {
  let cart = await db.cart.findFirst({
    where: {
      userId: userId,
    },
    include: includeProductClause,
  });
  if (!cart && errorOnFailure) {
    throw new Error('Cart not found');
  }
  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId: userId,
      },
      include: includeProductClause,
    });
  }
  return cart;
};

const updateOrCreateCartItem = async ({
  productId,
  cartId,
  amount,
}: {
  productId: string;
  cartId: string;
  amount: number;
}) => {
  let cartItem = await db.cartItem.findFirst({
    where: {
      productId,
      cartId,
    },
  });
  if (cartItem) {
    cartItem = await db.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        amount: cartItem.amount + amount,
      },
    });
  } else {
    cartItem = await db.cartItem.create({
      data: { amount, productId, cartId },
    });
  }
};

export const updateCart = async (cart: Cart) => {
  const cartItems = await db.cartItem.findMany({
    where: {
      cartId: cart.id,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  let numItemsInCart = 0;
  let cartTotal = 0;

  for (const item of cartItems) {
    numItemsInCart += item.amount;
    cartTotal += item.amount * item.product.price;
  }
  const tax = cart.taxRate * cartTotal;
  const shipping = cartTotal ? cart.shipping : 0;
  const orderTotal = cartTotal + tax + shipping;

  const currentCart = await db.cart.update({
    where: {
      id: cart.id,
    },
    data: {
      numItemsInCart,
      cartTotal,
      tax,
      orderTotal,
    },
    include: includeProductClause,
  });
  return { cartItems, currentCart };
};

export const addToCartAction = async (prevState: { message: string }, formData: FormData) => {
  const user = await getAuthUser();
  try {
    const productId = formData.get('productId') as string;
    const amount = Number(formData.get('amount'));
    await fetchProduct(productId);
    const cart = await fetchOrCreateCart({ userId: user.id });
    await updateOrCreateCartItem({ productId, cartId: cart.id, amount });
    await updateCart(cart);
  } catch (error) {
    return renderError(error);
  }
  return redirectLocalized('/cart');
};

export const removeCartItemAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const cartItemId = formData.get('id') as string;
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });
    await db.cartItem.delete({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });
    await updateCart(cart);
    revalidatePath('/cart');
    const t = await getTranslations('Actions');
    return { message: t('itemRemoved') };
  } catch (error) {
    return renderError(error);
  }
};

export const updateCartItemAction = async ({
  amount,
  cartItemId,
}: {
  amount: number;
  cartItemId: string;
}) => {
  const user = await getAuthUser();
  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });

    await db.cartItem.update({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      data: {
        amount,
      },
    });
    await updateCart(cart);
    revalidatePath('/cart');
    const t = await getTranslations('Actions');
    return { message: t('cartUpdated') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchUserOrders = async () => {
  const user = await getAuthUser();
  const orders = await db.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      product: {
        select: { id: true, name: true, company: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return orders;
};

export const fetchAdminOrders = async () => {
  await getAdminUser();

  const orders = await db.order.findMany({
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
  await getAdminUser();
  const [users, products] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { email: 'asc' },
    }),
    db.product.findMany({
      select: { id: true, name: true, company: true, price: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);
  return { users, products };
};

export const createAdminOrderAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  try {
    const raw = Object.fromEntries(formData);
    const data = validateWithZodSchema(adminOrderSchema, {
      ...raw,
      isPaid: formData.get('isPaid') === 'on',
    });
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true },
    });
    if (!user) {
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
  await getAdminUser();
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
      select: { id: true, email: true },
    });
    if (!user) {
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

export const deleteAdminOrderAction = async (prevState: {
  orderId: string;
}) => {
  const { orderId } = prevState;
  await getAdminUser();
  try {
    await db.order.delete({ where: { id: orderId } });
    revalidatePath('/admin/sales');
    revalidatePath('/account/orders');
    const t = await getTranslations('Actions');
    return { message: t('orderRemoved') };
  } catch (error) {
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

export const updateProfileNameAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  await getAuthUser();
  try {
    const raw = Object.fromEntries(formData);
    const { name } = validateWithZodSchema(updateProfileNameSchema, raw);
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    });
    revalidatePath('/account');
    revalidatePath('/account/settings');
    const t = await getTranslations('Actions');
    return { message: t('profileNameUpdated') };
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
