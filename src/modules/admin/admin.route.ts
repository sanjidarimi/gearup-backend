import { Router } from "express";
import { adminController } from "./admin.controller";

// Mounted behind authorize(UserRole.ADMIN) in app.ts.
const router = Router();

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", adminController.updateUserStatus);
router.get("/rentals", adminController.getAllRentals);

export const adminRoutes = router;
