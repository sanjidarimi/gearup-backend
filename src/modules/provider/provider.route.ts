import { Router } from "express";
import { providerController } from "./provider.controller";
import { fileUploader } from "../../helpers/fileUploader";

const router = Router();
router.get("/gear", providerController.getProviderGears);
router.post(
  "/gear",
  fileUploader.upload.single("file"),
  providerController.createGear,
);

router.put(
  "/gear/:id",
  fileUploader.upload.single("file"),
  providerController.updateGear,
);

router.delete(
  "/gear/:id",

  providerController.deleteGear,
);

router.get("/orders", providerController.getProviderOrders);
router.patch("/orders/:id", providerController.updateOrderStatus);
export const providerRouter = router;
