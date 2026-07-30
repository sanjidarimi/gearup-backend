import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/gear", gearController.getGear);
router.get("/gear/:id", gearController.getGearById);

export const gearRoute = router;
