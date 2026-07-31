import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { paymentController } from "./payment.controller";

const router = Router();
router.post(
  "/create",
  authorize(UserRole.CUSTOMER),
  paymentController.createPayment,
);
router.post("/webhook", paymentController.handleStripeWebhook);
router.get(
  "/confirm",
  authorize(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.confirmPayment,
);
router.get("/", authorize(UserRole.CUSTOMER), paymentController.getMyPayments);
router.get(
  "/:id",
  authorize(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getPaymentById,
);
export const paymentRoutes = router;
