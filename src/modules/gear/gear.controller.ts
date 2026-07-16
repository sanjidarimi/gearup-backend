import { Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "./../../utils/CatchAsync";
import { gearService } from "./gear.service";

const getGear = catchAsync(async (req: Request, res: Response) => {
  const result = await gearService.getGearIntoDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gears retrieved successfully",
    data: result,
  });
});

const createGear = catchAsync(async (req: Request, res: Response) => {
``
  const payload = {
    ...req.body,
    providerId: req.body.providerId,
  };

  const result = await gearService.createGearIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item created successfully",
    data: result,
  });
});

export const gearController = {
  getGear,
  createGear,
};
