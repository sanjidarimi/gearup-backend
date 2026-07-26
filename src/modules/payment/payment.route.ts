import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authorize } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();
router.get("/create",
    authorize(UserRole.CUSTOMER),
     paymentController.createPaymentCheckout);
export const paymentRoutes = router;
