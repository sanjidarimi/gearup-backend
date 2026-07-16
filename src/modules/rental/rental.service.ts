import httpStatus from "http-status";
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
      const updatedGear = await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: gear.stock - item.quantity,
          isAvailable: gear.stock - item.quantity > 0,
        },
      });
      itemToCreate.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        price: gear.pricePerDay,
      });
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
                select: { name: true, brand: true },
              },
            },
          },
        },
      });

      return order;
    }
  });
  return newOrder;
};
const getMyRentalsFromDB = async (customerId: string) => {
  return await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const rentalService = {
  createRentalIntoDB,
  getMyRentalsFromDB
};
