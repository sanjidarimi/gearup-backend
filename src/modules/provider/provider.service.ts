import httpStatus from "http-status";
import {
  GearItem,
  Prisma,
  RentalStatus,
} from "../../../generated/prisma/client";
import { AppError } from "../../error/AppError";
import { uploadToCloudinary } from "../../helpers/uploadToCloudinary";
import { prisma } from "../../lib/prisma";

type GearInput = Record<string, unknown>;

// Providers may only move an order forward along the rental flow. PAID is set
// by the Stripe payment, never by hand.
const ALLOWED_TRANSITIONS: Record<RentalStatus, RentalStatus[]> = {
  PLACED: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
  CONFIRMED: [RentalStatus.CANCELLED],
  PAID: [RentalStatus.PICKED_UP],
  PICKED_UP: [RentalStatus.RETURNED],
  RETURNED: [],
  CANCELLED: [],
};

const toNumber = (value: unknown) =>
  value === undefined || value === null || value === ""
    ? undefined
    : Number(value);

const toBoolean = (value: unknown) =>
  value === undefined ? undefined : value === true || value === "true";

// Only copy the fields a provider is allowed to set, coercing multipart
// strings to the right types. providerId always comes from the token.
const pickGearFields = (input: GearInput, requireAll: boolean) => {
  const data: Partial<
    Pick<
      GearItem,
      | "name"
      | "description"
      | "brand"
      | "pricePerDay"
      | "stock"
      | "isAvailable"
      | "imageUrl"
      | "categoryId"
    >
  > = {};

  if (typeof input.name === "string") data.name = input.name.trim();
  if (typeof input.description === "string")
    data.description = input.description.trim();
  if (typeof input.brand === "string") data.brand = input.brand.trim() || null;
  if (typeof input.categoryId === "string") data.categoryId = input.categoryId;
  if (typeof input.imageUrl === "string")
    data.imageUrl = input.imageUrl.trim() || null;

  const pricePerDay = toNumber(input.pricePerDay);
  if (pricePerDay !== undefined) {
    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Price per day must be a number greater than 0",
      );
    }
    data.pricePerDay = pricePerDay;
  }

  const stock = toNumber(input.stock);
  if (stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Stock must be a whole number of 0 or more",
      );
    }
    data.stock = stock;
  }

  const isAvailable = toBoolean(input.isAvailable);
  if (isAvailable !== undefined) data.isAvailable = isAvailable;

  if (requireAll) {
    if (!data.name || !data.description || !data.categoryId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Name, description and category are required",
      );
    }
    if (data.pricePerDay === undefined) {
      throw new AppError(httpStatus.BAD_REQUEST, "Price per day is required");
    }
  }

  return data;
};

const ensureCategoryExists = async (categoryId?: string) => {
  if (!categoryId) return;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new AppError(httpStatus.BAD_REQUEST, "Selected category not found");
  }
};

const getProviderGearsFromDB = async (
  providerId: string,
): Promise<GearItem[]> => {
  return prisma.gearItem.findMany({
    where: { providerId },
    include: {
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createGearIntoDB = async (
  providerId: string,
  input: GearInput,
  file?: Express.Multer.File,
): Promise<GearItem> => {
  const data = pickGearFields(input, true);
  await ensureCategoryExists(data.categoryId);

  if (file) {
    const uploadResult = await uploadToCloudinary(file);
    data.imageUrl = uploadResult.secure_url;
  }

  // Nothing in stock means nothing to book.
  if (data.stock === 0) data.isAvailable = false;

  return prisma.gearItem.create({
    data: {
      ...(data as Prisma.GearItemUncheckedCreateInput),
      providerId,
    },
  });
};

const updateGearInDB = async (
  gearId: string,
  providerId: string,
  input: GearInput,
  file?: Express.Multer.File,
): Promise<GearItem> => {
  const existing = await prisma.gearItem.findFirst({
    where: { id: gearId, providerId },
  });

  if (!existing) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Gear item not found or you are not authorized to update it",
    );
  }

  const data = pickGearFields(input, false);
  await ensureCategoryExists(data.categoryId);

  if (file) {
    const uploadResult = await uploadToCloudinary(file);
    data.imageUrl = uploadResult.secure_url;
  }

  const nextStock = data.stock ?? existing.stock;
  if (nextStock === 0) data.isAvailable = false;

  return prisma.gearItem.update({
    where: { id: gearId },
    data,
  });
};

const deleteGearFromDB = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findFirst({
    where: { id: gearId, providerId },
    include: { _count: { select: { rentalItems: true } } },
  });

  if (!gear) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Gear item not found or you are not authorized to delete this item",
    );
  }

  if (gear._count.rentalItems > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This gear has rental history and can't be deleted. Turn off availability to hide it instead.",
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { gearItemId: gearId } });
    return tx.gearItem.delete({ where: { id: gearId } });
  });
};

const getProviderOrdersFromDB = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gearItem: {
            providerId: providerId,
          },
        },
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
      items: {
        where: {
          gearItem: {
            providerId: providerId,
          },
        },
        include: {
          gearItem: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateOrderStatusInDB = async (
  orderId: string,
  providerId: string,
  status: RentalStatus,
) => {
  if (!Object.values(RentalStatus).includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid rental status");
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            gearItem: {
              providerId: providerId,
            },
          },
        },
      },
      include: { items: { include: { gearItem: true } } },
    });

    if (!order) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Rental order not found or unauthorized to manage this order",
      );
    }

    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot change an order from ${order.status} to ${status}`,
      );
    }

    // Stock was reserved when the order was placed; give it back once the
    // gear is returned or the rental is cancelled.
    if (status === RentalStatus.CANCELLED || status === RentalStatus.RETURNED) {
      for (const item of order.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: {
            stock: { increment: item.quantity },
            isAvailable: true,
          },
        });
      }
    }

    return tx.rentalOrder.update({
      where: { id: orderId },
      data: { status },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
        items: { include: { gearItem: true } },
      },
    });
  });
};

export const providerService = {
  updateGearInDB,
  deleteGearFromDB,
  createGearIntoDB,
  getProviderOrdersFromDB,
  updateOrderStatusInDB,
  getProviderGearsFromDB,
};
