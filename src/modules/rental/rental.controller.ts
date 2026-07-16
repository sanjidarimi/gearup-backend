import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync";
import { rentalService } from "./rental.service";
import httpStatus from "http-status"
import { sendResponse } from "../../utils/sendResponse";
const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const payload = { ...req.body , customerId};
  const result = await rentalService.createRentalIntoDB(payload)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});
const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const result = await rentalService.getMyRentalsFromDB(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My rentals retrieved successfully",
    data: result,
  });
})
export const rentalController = {
  createRental,
  getMyRentals
};
