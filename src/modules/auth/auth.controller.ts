import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
const registerUser = catchAsync(async (req: Request, res: Response) => {
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
    
 
    const { accessToken, refreshToken, user } = await authService.getUserIntoDB(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Login successfully",
      
      data: { user }, 
    });
  },
);
const getMe = catchAsync(async (req: Request, res: Response) => {
  const profile = await authService.getMyProfileIntoDB(req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "user profile",
    data: { profile },
  });
});
export const authController = {
  registerUser,
  loginUser,
  getMe,
};
