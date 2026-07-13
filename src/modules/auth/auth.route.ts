import { Router } from "express";
import { authController } from "./auth.controller";


const router = Router();
router.post("/register", authController.createUser);
router.get("/login", authController.loginUser)
export const authRoutes = router;
