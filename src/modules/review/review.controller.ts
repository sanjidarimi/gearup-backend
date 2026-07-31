import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const payload = { ...req.body, customerId };

  const result = await reviewService.createReviewInDB(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getGearReviews = catchAsync(async (req: Request, res: Response) => {
  const { gearItemId } = req.params;
  const result = await reviewService.getGearReviewsFromDB(gearItemId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Gear reviews retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const result = await reviewService.getMyReviewsFromDB(customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User reviews retrieved successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;

  await reviewService.deleteReviewFromDB(id as string, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const reviewController = {
  createReview,
  getGearReviews,
  getMyReviews,
  deleteReview,
};
