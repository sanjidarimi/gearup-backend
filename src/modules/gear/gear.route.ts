import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authorize } from "../../middleware/auth";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/gear", gearController.getGear);
router.get("/gear/:id", gearController.getGearById);

router.post(
  "/provider/gear",
  authorize(UserRole.PROVIDER),
  gearController.createGear,
);
router.put(
  "/provider/gear/:id",
  authorize(UserRole.PROVIDER),
  gearController.updateGear,
);
router.delete("/provider/gear/:id", gearController.deleteGear);

export const gearRoute = router;
