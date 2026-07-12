import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";

const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };
};

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await userService.createUserIntoDB(payload);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Registration successful",
    data: { user },
  });
});
export const userController = {
  createUser,
};
