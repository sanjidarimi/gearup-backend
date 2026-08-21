import { GearItem, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getGearIntoDB = async (query: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.GearItemWhereInput = {
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
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
      ],
    }),
    ...(query.isAvailable !== undefined && {
      isAvailable: query.isAvailable,
    }),
  };

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
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
      skip,
      take: limit,
    }),
    prisma.gearItem.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getSingleGearIntoDB = async (gearId: string) => {
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });
  return gear;
};

export const gearService = {
  getGearIntoDB,

  getSingleGearIntoDB,
};
