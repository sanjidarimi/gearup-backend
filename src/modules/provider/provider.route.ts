import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { providerController } from "./provider.controller";

const router = Router();
router.post(
  "/gear",
  authorize(UserRole.PROVIDER),
  providerController.createGear,
);

router.put(
  "/gear/:id",
  authorize(UserRole.PROVIDER),
  providerController.updateGear,
);

router.delete(
  "/gear/:id",
  authorize(UserRole.PROVIDER),
  providerController.deleteGear,
);

router.get("/orders", providerController.getProviderOrders);

export const providerRouter = router;
