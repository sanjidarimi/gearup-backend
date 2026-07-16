import { Router } from "express";
import { gearController } from "./gear.controller";
import { authorize } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/gear", gearController.getGear);
router.post("/provider/gear",authorize(UserRole.PROVIDER), gearController.createGear);
export const gearRoute = router;
