import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await authService.createUserIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "user created successfully",
    data: { user },
  });
});

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await authService.getUserIntoDB(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Login successfully",
      data: { user },
    });
  },
);
export const authController = {
  createUser,
  loginUser,
};
