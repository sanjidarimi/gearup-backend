import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/CatchAsync";
import { userService } from "./user.service";

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
