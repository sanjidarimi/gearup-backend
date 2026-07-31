import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { providerController } from "./provider.controller";

const router = Router();
router.post(
  "/gear",

  providerController.createGear,
);

router.put(
  "/gear/:id",

  providerController.updateGear,
);

router.delete(
  "/gear/:id",

  providerController.deleteGear,
);

router.get("/orders", providerController.getProviderOrders);
router.patch("/orders/:id", providerController.updateOrderStatus)
export const providerRouter = router;
