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
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization);

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please login to access this resource",
      );
    }

    const verifyToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifyToken.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        verifyToken.error || "Invalid token",
      );
    }

    const { role, id } = verifyToken.data as JwtPayload;

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
      throw new AppError(httpStatus.UNAUTHORIZED, "Account not found");
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been suspended",
      );
    }

    // Trust the database over the token for role, so role changes apply
    // immediately.
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "FORBIDDEN: You do not have permission to access this resource",
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    next();
  });
};
