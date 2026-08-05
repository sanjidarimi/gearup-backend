import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

import { UserRole } from "../../generated/prisma/enums";
import config from "../config";
import { AppError } from "../error/AppError";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/CatchAsync";
import { jwtUtils } from "../utils/jwt";

export const authorize = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please login to access this resource",
      );
    }

    const verifyToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    console.log("verify token", verifyToken);
    if (!verifyToken.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        verifyToken.error || "Invalid token",
      );
    }

    const { name, email, role, id } = verifyToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "FORBIDDEN: You do not have permission to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "Account not found");
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        "Your account has been blocked",
      );
    }

    req.user = { id, email, name, role };

    next();
  });
};
