// src/middlewares/globalErrorHandler.ts
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../error/AppError";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let stack: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
  } else if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
  }

  if (config.app_url === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      error: err,
      stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err instanceof AppError ? message : "Internal Server Error",
  });
};
