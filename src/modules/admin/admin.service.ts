import httpStatus from "http-status";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getAllUsersFromDB = async () => {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatusInDB = async (
  userId: string,
  adminId: string,
  status: unknown,
) => {
  if (status !== UserStatus.ACTIVE && status !== UserStatus.SUSPENDED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Status must be either ACTIVE or SUSPENDED",
    );
  }

  if (userId === adminId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can't change the status of your own account",
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === UserRole.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin accounts can't be suspended",
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: userSelect,
  });
};

const getAllRentalsFromDB = async () => {
  return prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      payment: true,
      items: {
        include: {
          gearItem: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
              providerId: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllRentalsFromDB,
};
