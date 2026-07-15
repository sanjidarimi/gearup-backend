import { NextFunction, Request, Response } from "express";
import { catchAsync } from "./../../utils/CatchAsync";
import { gearService } from "./gear.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const getGear = catchAsync(
  async (req: Request, res : Response) => {
    
  const getGear = await gearService.getGearIntoDB(req)
  sendResponse(res, {
success: true,
    statusCode: httpStatus.CREATED,
    message: "get all gear successfully",
    data: { getGear },
  })
  },
);
export const gearController = {
  getGear,
};
