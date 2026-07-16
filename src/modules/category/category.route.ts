import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

router.post("/categories", categoryController.createCategory);
router.get("/categories", categoryController.getCategories);

export const categoryRoutes = router;