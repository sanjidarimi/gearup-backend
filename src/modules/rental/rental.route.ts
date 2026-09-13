import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { rentalController } from "./rental.controller";

const router = Router();
router.post(
  "/rentals",
  authorize(UserRole.CUSTOMER),
  rentalController.createRental,
);
router.get(
  "/my-rentals",
  authorize(UserRole.CUSTOMER),
  rentalController.getMyRentals,
);
router.get(
  "/rentals/:id",
  authorize(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  rentalController.getSingleRental,
);

export const rentalRoutes = router;
