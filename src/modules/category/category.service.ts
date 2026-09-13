import { Category, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../error/AppError";
import httpStatus from "http-status";

const createCategoryIntoDB = async (
  payload: Prisma.CategoryCreateInput,
): Promise<Category> => {
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";

  if (!name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category name is required");
  }

  const isCategoryExist = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (isCategoryExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Category with name '${name}' already exists.`,
    );
  }

  const newCategory = await prisma.category.create({
    data: { name },
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
