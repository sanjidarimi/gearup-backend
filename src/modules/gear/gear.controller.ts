import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "./../../utils/CatchAsync";
import { gearService } from "./gear.service";

const getGear = catchAsync(async (req: Request, res: Response) => {
  const result = await gearService.getGearIntoDB({
    category: req.query.category as string,
    brand: req.query.brand as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gears retrieved successfully",
    data: result,
  });
});

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const payload = { ...req.body, providerId };
  const result = await gearService.createGearIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item created successfully",
    data: result,
  });
});

const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const result = await gearService.getSingleGearIntoDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get the single gear",
      data: result,
    });
  },
);
const updateGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const providerId = req.user?.id as string;
  const payload = req.body;

  const result = await gearService.updateGearInDB(id, providerId, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: result,
  });
});

const deleteGear  = catchAsync(async (req:Request, res:Response) => {
  const id = req.params.id as string;
  const providerId = req.user?.id as string;
  await gearService.deleteGearFromDB(id, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item removed successfully",
    data: null,
  });
})
export const gearController = {
  getGear,
  createGear,
  getGearById,
  updateGear,
  deleteGear
};
