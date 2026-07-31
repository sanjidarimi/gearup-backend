import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getCategories);

export const categoryRoutes = router;