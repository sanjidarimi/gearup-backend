import httpStatus from "http-status";
import { RentalStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { IRentalOrderPayload } from "./rental.interface";
const createRentalIntoDB = async (payload: IRentalOrderPayload) => {
  const { customerId, startDate, endDate, items } = payload;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be after start date",
    );
  }

  const timeDifference = end.getTime() - start.getTime();
  const totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

  const newOrder = await prisma.$transaction(async (tx) => {
    let calculateTotalPrice = 0;
    const itemToCreate = [];

    for (const item of items) {
      const gear = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });

      if (!gear) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Gear item with ID ${item.gearItemId} not found`,
        );
      }

      if (!gear.isAvailable) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `'${gear.name}' is currently unavailable`,
        );
      }

      if (gear.stock < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for '${gear.name}'. Available: ${gear.stock}, Requested: ${item.quantity}`,
        );
      }

      const itemTotalPrice = gear.pricePerDay * totalDays * item.quantity;
      calculateTotalPrice += itemTotalPrice;

      const updatedStock = gear.stock - item.quantity;
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: updatedStock,
          isAvailable: updatedStock > 0,
        },
      });

      itemToCreate.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        price: gear.pricePerDay,
      });
    }

    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount: calculateTotalPrice,
        items: {
          create: itemToCreate,
        },
      },
      include: {
        items: {
          include: {
            gearItem: {
              select: { name: true, brand: true, imageUrl: true },
            },
          },
        },
      },
    });

    return order;
  });

  return newOrder;
};
const getMyRentalsFromDB = async (customerId: string) => {
  return await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      payment: true,
      items: {
        include: {
          gearItem: {
            select: { id: true, name: true, brand: true, imageUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSingleRentalFromDB = async (
  rentalId: string,
  userId: string,
  userRole: string,
) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: {
      payment: true,
      items: {
        include: {
          gearItem: true,
        },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (userRole === "CUSTOMER" && rental.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to view this rental order",
    );
  }

  return rental;
};

const updateOrderStatusInDB = async (
  orderId: string,
  providerId: string,
  newStatus: RentalStatus,
) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { gearItem: true },
        },
      },
    });

    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");

    if (order.status === "CANCELLED" || order.status === "RETURNED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Order is already marked as ${order.status}`,
      );
    }

    const isOwner = order.items.every(
      (item) => item.gearItem.providerId === providerId,
    );

    if (!isOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update this order",
      );
    }

    const shouldRestoreStock =
      newStatus === "CANCELLED" || newStatus === "RETURNED";

    if (shouldRestoreStock) {
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

    return await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  });
};
export const rentalService = {
  createRentalIntoDB,
  getMyRentalsFromDB,
  getSingleRentalFromDB,
  updateOrderStatusInDB,
};
