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
export const gearRoute = router;
