import httpStatus from "http-status";
import { RentalStatus, UserRole } from "../../../generated/prisma/enums";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReviewInDB = async (payload: ICreateReviewPayload) => {
  const { customerId, gearItemId, rating, comment } = payload;

  // 1. Verify if the customer has rented and completed this gear item
  const hasRented = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      status: {
        in: [RentalStatus.PAID, RentalStatus.PICKED_UP, RentalStatus.RETURNED],
      },
      items: {
        some: { gearItemId },
      },
    },
  });

  if (!hasRented) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review gear items that you have rented and paid for.",
    );
  }

  // 2. Prevent Duplicate Reviews (Check existing review)
  const existingReview = await prisma.review.findFirst({
    where: { customerId, gearItemId },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this item. You can update your existing review.",
    );
  }

  // 3. Create Review
  const newReview = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return newReview;
};

const getGearReviewsFromDB = async (gearItemId: string) => {
  const reviews = await prisma.review.findMany({
    where: { gearItemId },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Average Rating dynamically
  const aggregate = await prisma.review.aggregate({
    where: { gearItemId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    meta: {
      averageRating: aggregate._avg.rating
        ? Number(aggregate._avg.rating.toFixed(1))
        : 0,
      totalReviews: aggregate._count.rating,
    },
  };
};

const getMyReviewsFromDB = async (customerId: string) => {
  return await prisma.review.findMany({
    where: { customerId },
    include: {
      gearItem: {
        select: { id: true, name: true, brand: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const deleteReviewFromDB = async (
  reviewId: string,
  userId: string,
  userRole: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Authorization Check: Customer can only delete their own review; Admin can delete any
  if (userRole !== UserRole.ADMIN && review.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this review",
    );
  }

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};

export const reviewService = {
  createReviewInDB,
  getGearReviewsFromDB,
  getMyReviewsFromDB,
  deleteReviewFromDB,
};
