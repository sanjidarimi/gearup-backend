import { Router } from "express";
import app from "../../app";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/gear", gearController.getGear);
export const gearRoute = router;
