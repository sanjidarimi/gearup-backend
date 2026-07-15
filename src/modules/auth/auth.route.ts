import { Router } from "express";
import { authController } from "./auth.controller";


const router = Router();
router.post("/register", authController.registerUser);
router.get("/login", authController.loginUser)
router.get("/get-me", authController.getMe)








export const authRoutes = router;
