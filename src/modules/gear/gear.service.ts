import { GearItem, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getGearIntoDB = async (query: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  return await prisma.gearItem.findMany({
    where: {
      ...(query.category && {
        category: {
          name: query.category,
        },
      }),
      ...(query.brand && {
        brand: query.brand,
      }),
      ...(query.minPrice || query.maxPrice
        ? {
            pricePerDay: {
              gte: query.minPrice,
              lte: query.maxPrice,
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      brand: true,
      pricePerDay: true,
      stock: true,
      imageUrl: true,
      isAvailable: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
};

const createGearIntoDB = async (
  payload: Prisma.GearItemUncheckedCreateInput,
): Promise<GearItem> => {
  const newGear = await prisma.gearItem.create({
    data: payload,
  });
  return newGear;
};
const getSingleGearIntoDB = async (gearId: string) => {
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });
  return gear;
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
  await prisma.gearItem.findFirstOrThrow({
    where: { id: gearId, providerId },
  });
  const deleteGear = await prisma.gearItem.delete({
    where: { id: gearId },
  });
  return deleteGear
};
export const gearService = {
  getGearIntoDB,
  createGearIntoDB,
  getSingleGearIntoDB,
  updateGearInDB,
  deleteGearFromDB,
};
