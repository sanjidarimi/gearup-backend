import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const payload = { ...req.body, customerId };
  const result = await rentalService.createRentalIntoDB(payload);
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
});
const getSingleRental = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = rentalService.getSingleRentalFromDB(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "rentals retrieved successfully",
    data: result,
  });
});
export const rentalController = {
  createRental,
  getMyRentals,
  getSingleRental
};
