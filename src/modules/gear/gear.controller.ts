import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "./../../utils/CatchAsync";
import { gearService } from "./gear.service";

const getGear = catchAsync(async (req: Request, res: Response) => {

  const isAvailableParsed =
    req.query.isAvailable !== undefined
      ? req.query.isAvailable === "true"
      : undefined;

  const result = await gearService.getGearIntoDB({
    category: req.query.category as string,
    brand: req.query.brand as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    search: req.query.search as string,
    isAvailable: isAvailableParsed,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gears retrieved successfully",
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await gearService.getSingleGearIntoDB(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: result,
  });
});

export const gearController = {
  getGear,
  getGearById,
};