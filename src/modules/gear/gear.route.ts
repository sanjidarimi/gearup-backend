import { Router } from "express";
import app from "../../app";

const router = Router();
app.get("/gear");
export const gearRoute = router;
