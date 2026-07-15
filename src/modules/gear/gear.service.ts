import { Request } from "express";
import { prisma } from "../../lib/prisma";

const getGearIntoDB = async (req: Request) => {
  const gearItem = await prisma.gearItem.findMany();
  return gearItem;
};
export const gearService = {
  getGearIntoDB,
};
