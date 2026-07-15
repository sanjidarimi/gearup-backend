import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/gear", gearController.getGear);
router.post("/provider/gear", gearController.createGear);
export const gearRoute = router;
