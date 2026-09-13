import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
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
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.issues[0]?.message ?? "Invalid request data";
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    stack = err.stack;
    if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "The requested resource was not found";
    } else if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "A record with these details already exists";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.CONFLICT;
      message =
        "This record is linked to other data (rentals or reviews) and can't be changed this way";
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database request failed";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data sent to the server";
    stack = err.stack;
  } else if (err instanceof MulterError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.message;
    stack = err.stack;
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Malformed JSON in request body";
    stack = err.stack;
  } else if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
  }

  if (config.node_env === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      error: err,
      stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
