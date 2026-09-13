import { Prisma } from "../../../generated/prisma/client";
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
  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const limit =
    query.limit && query.limit > 0 ? Math.min(Math.floor(query.limit), 200) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.GearItemWhereInput = {
    ...(query.category && {
      category: {
        name: { equals: query.category, mode: "insensitive" },
      },
    }),
    ...(query.brand && {
      brand: { equals: query.brand, mode: "insensitive" },
    }),

    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      pricePerDay: {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
      ],
    }),
    // "Available" means bookable right now: switched on and in stock.
    ...(query.isAvailable === true && {
      isAvailable: true,
      stock: { gt: 0 },
    }),
    ...(query.isAvailable === false && {
      OR: [{ isAvailable: false }, { stock: { lte: 0 } }],
    }),
  };

  // search and isAvailable=false both use OR, so combine them with AND.
  if (query.search && query.isAvailable === false) {
    delete where.OR;
    where.AND = [
      {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { brand: { contains: query.search, mode: "insensitive" } },
        ],
      },
      { OR: [{ isAvailable: false }, { stock: { lte: 0 } }] },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        pricePerDay: true,
        stock: true,
        imageUrl: true,
        isAvailable: true,
        categoryId: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
    include: {
      category: {
        select: { id: true, name: true },
      },
      provider: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return gear;
};

export const gearService = {
  getGearIntoDB,
  getSingleGearIntoDB,
};
