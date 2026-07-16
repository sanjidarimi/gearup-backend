import { Category, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../error/AppError";
import httpStatus from "http-status";

const createCategoryIntoDB = async (
  payload: Prisma.CategoryCreateInput
): Promise<Category> => {
  const isCategoryExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (isCategoryExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Category with name '${payload.name}' already exists.`
    );
  }


  const newCategory = await prisma.category.create({
    data: payload,
  });

  return newCategory;
};

const getAllCategoriesFromDB = async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return categories;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
};