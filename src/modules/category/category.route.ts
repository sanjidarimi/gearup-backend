import { Router } from "express";
import { categoryController } from "./category.controller";
import { authorize } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/",authorize(UserRole.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getCategories);

export const categoryRoutes = router;