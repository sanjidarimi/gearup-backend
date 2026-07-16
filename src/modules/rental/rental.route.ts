import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { rentalController } from "./rental.controller";

const router = Router();
router.post(
  "/rental",
  authorize(UserRole.CUSTOMER),
  rentalController.createRental,
);
export const rentalRoutes = router;
