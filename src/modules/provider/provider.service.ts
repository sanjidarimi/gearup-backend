
import { GearItem, Prisma } from "../../../generated/prisma/client";
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
  await prisma.gearItem.findFirstOrThrow({
    where: { id: gearId, providerId },
  });
  const deleteGear = await prisma.gearItem.delete({
    where: { id: gearId },
  });
  return deleteGear
};


export const providerService = {
    updateGearInDB, deleteGearFromDB, createGearIntoDB
}