import {  GearItem, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getGearIntoDB = async (): Promise<GearItem[]> => {
  const gearItems = await prisma.gearItem.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  return gearItems;
};

const createGearIntoDB = async (
  payload: Prisma.GearItemUncheckedCreateInput
): Promise<GearItem> => {
  const newGear = await prisma.gearItem.create({
    data: payload,
  });
  return newGear;
};

export const gearService = {
  getGearIntoDB,
  createGearIntoDB,
};