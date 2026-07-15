import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import { UserRole } from "../../../generated/prisma/enums";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { sendResponse } from "../../utils/sendResponse";
import { authController } from "./auth.controller";
const router = Router();
router.post("/register", authController.registerUser);
router.get("/login", authController.loginUser);
router.get(
  "/get-me",
  (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;
    const verifyToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );
    // console.log(verifyToken)

    if (typeof verifyToken === "string") {
      throw new Error(verifyToken);
    }
    const { name, email, role, id } = verifyToken;
    const requiredRoles = [
      UserRole.ADMIN,
      UserRole.CUSTOMER,
      UserRole.PROVIDER,
    ];
    if (!requiredRoles.includes(role)) {
      sendResponse(res, {
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message: "FORBIDDEN, your not permission to access this resource",
      });
    }
    req.user = {
      id,
      name,
      email,
      role,
    };
    next();
  },
  authController.getMe,
);

export const authRoutes = router;
