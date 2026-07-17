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
router.get("/rentals/:id", rentalController.getSingleRental);

router.patch(
  "/provider/orders/:id",
  authorize(UserRole.PROVIDER),
  rentalController.updateOrderStatus
);
export const rentalRoutes = router;
