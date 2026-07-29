import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { paymentController } from "./payment.controller";

const router = Router();
router.post(
  "/create",
  authorize(UserRole.CUSTOMER),
  paymentController.createPaymentCheckout,
);
router.post("/webhook", paymentController.handleStripeWebhook)
export const paymentRoutes = router;
