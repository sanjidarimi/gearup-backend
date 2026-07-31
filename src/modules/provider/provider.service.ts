import httpStatus from "http-status";
import {
  GearItem,
  Prisma,
  RentalStatus,
} from "../../../generated/prisma/client";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";

const createGearIntoDB = async (
  payload: Prisma.GearItemUncheckedCreateInput,
): Promise<GearItem> => {
  const newGear = await prisma.gearItem.create({
    data: payload,
  });
  return newGear;
};

const updateGearInDB = async (
  gearId: string,
  providerId: string,
  payload: Partial<GearItem>,
) => {
  await prisma.gearItem.findFirstOrThrow({
    where: { id: gearId, providerId },
  });
  const updatedGearItem = await prisma.gearItem.update({
    where: { id: gearId },
    data: payload,
  });
  return updatedGearItem;
};

const deleteGearFromDB = async (gearId: string, providerId: string) => {
  const deleted = await prisma.gearItem.deleteMany({
    where: { id: gearId, providerId },
  });
  if (deleted.count === 0) {
    throw new AppError(
      404,
      "Gear item not found or you are not authorized to delete this item",
    );
  }

  return deleted;
};
const getProviderOrdersFromDB = async (providerId: string) => {
  const providerOrders = await prisma.rentalOrder.findMany({
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

  return providerOrders;
};

const updateOrderStatusInDB = async (
  orderId: string,
  providerId: string,
  status: RentalStatus
) => {
  const order = await prisma.rentalOrder.findFirst({
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
  });

  if (!order) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Rental order not found or unauthorized to manage this order"
    );
  }

  if (order.status === RentalStatus.CANCELLED || order.status === RentalStatus.RETURNED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change status of an order that is already ${order.status}`
    );
  }
  const updatedOrderStatus = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
  });

  return updatedOrderStatus;
};

export const providerService = {
  updateGearInDB,
  deleteGearFromDB,
  createGearIntoDB,
  getProviderOrdersFromDB,
  updateOrderStatusInDB,
};
