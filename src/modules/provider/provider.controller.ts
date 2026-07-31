import { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../error/AppError";
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

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  if (!providerId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  const result = await providerService.getProviderOrdersFromDB(providerId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Provider orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params 
  const providerId = req.user?.id;
  if (!providerId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  const { status } = req.body;
  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
  }
  const result = await providerService.updateOrderStatusInDB(id as string, providerId, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order status updated successfully",
    data: result,
  });
});
export const providerController = {
  createGear,
  updateGear,
  deleteGear,
  getProviderOrders,
  updateOrderStatus
};
