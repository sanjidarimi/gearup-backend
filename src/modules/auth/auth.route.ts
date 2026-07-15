import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.registerUser);
router.get("/login", authController.loginUser);
router.get(
  "/get-me",
  authorize(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER),
  authController.getMe,
);
export const authRoutes = router;
