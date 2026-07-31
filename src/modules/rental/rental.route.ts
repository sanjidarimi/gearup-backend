import { Router } from "express";
import { rentalController } from "./rental.controller";

const router = Router();
router.post(
  "/rentals",

  rentalController.createRental,
);
router.get(
  "/my-rentals",

  rentalController.getMyRentals,
);
router.get("/rentals/:id", rentalController.getSingleRental);

export const rentalRoutes = router;
