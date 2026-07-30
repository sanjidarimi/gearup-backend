import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { providerService } from "./provider.service";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const payload = { ...req.body, providerId };
  const result = await providerService.createGearIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item created successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const providerId = req.user?.id as string;
  const payload = req.body;

  const result = await providerService.updateGearInDB(id, providerId, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const providerId = req.user?.id as string;
  await providerService.deleteGearFromDB(id, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item removed successfully",
    data: null,
  });
});

export const providerController = {
  createGear,
  updateGear,
  deleteGear,
};
