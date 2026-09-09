'use server';

import db from '@/utils/db';
import { getAdminUser, getAuthUser, getSession } from '@/utils/session';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  imageSchema,
  callbackInquirySchema,
  changePasswordSchema,
  partnershipInquirySchema,
  productSchema,
  reviewSchema,
  updateProfileNameSchema,
  validateWithZodSchema,
} from './schemas';
import {
  deleteAvatarImage,
  deleteImage,
  uploadAvatarImage,
  uploadImage,
} from './images';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Cart } from '@prisma/client';
import type { CatalogSort } from '@/utils/catalog-query';
const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

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

export const fetchFeaturedProducts = async (take = 6) => {
  return db.product.findMany({
    where: {
      featured: true,
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
    distinct: ["company"],
    select: { company: true },
    orderBy: { company: "asc" },
  });
  return rows.map((row) => row.company);
};

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!product) {
    redirect('/products');
  }
  return product;
};

export const createProductAction = async (
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAdminUser();
  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await db.product.create({
      data: {
        ...validatedFields,
        image: fullPath,
        userId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect('/admin/products');
};

export const fetchAdminProducts = async () => {
  await getAdminUser();
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();
  try {
    const product = await db.product.delete({
      where: {
        id: productId,
      },
    });
    await deleteImage(product.image);
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
  if (!product) redirect('/admin/products');
  return product;
};

export const updateProductAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  await getAdminUser();
  try {
    const productId = formData.get('id') as string;
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(productSchema, rawData);

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        ...validatedFields,
      },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    const t = await getTranslations('Actions');
    return { message: t('productUpdated') };
  } catch (error) {
    return renderError(error);
  }
};
export const updateProductImageAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const user = await getAdminUser();
  try {
    const image = formData.get('image') as File;
    const productId = formData.get('id') as string;
    const oldImageUrl = formData.get('url') as string;

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, userId: true },
    });
    if (!product || product.userId !== user.id) {
      throw new Error('Product not found');
    }

    const validatedFile = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFile.image);
    await deleteImage(oldImageUrl);
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    const t = await getTranslations('Actions');
    return { message: t('imageUpdated') };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const user = await getAuthUser();
  const favorite = await db.favorite.findFirst({
    where: {
      productId,
      userId: user.id,
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
    await db.review.create({
      data: {
        ...validatedFields,
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
  redirect('/cart');
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
      isPaid: true,
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
    where: {
      isPaid: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return orders;
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
