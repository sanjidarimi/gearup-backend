import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/", gearController.getGear);
router.get("/:id", gearController.getGearById);

export const gearRoute = router;
