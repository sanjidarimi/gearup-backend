import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";

import { validateRequest } from "../../middleware/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  authorize(UserRole.CUSTOMER),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

router.get("/gear/:gearItemId", reviewController.getGearReviews);

router.get(
  "/my-reviews",
  authorize(UserRole.CUSTOMER),
  reviewController.getMyReviews,
);

router.delete(
  "/:id",
  authorize(UserRole.CUSTOMER, UserRole.ADMIN),
  reviewController.deleteReview,
);

export const reviewRoutes = router;
