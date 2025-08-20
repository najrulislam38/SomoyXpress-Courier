import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "../user/user.interface";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import { crateParcelZodSchema } from "./parcel.validation";

const router = Router();

router.post(
  "/create",
  withAuth(UserRole.SENDER),
  validateRequestUseZod(crateParcelZodSchema),
  ParcelController.createParcel
);
router.get(
  "/",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.getAllParcel
);
router.get(
  "/:id",
  withAuth(...Object.values(UserRole)),
  ParcelController.getSingleParcel
);

router.patch(
  "/cancel/:id",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.cancelParcel
);

export const ParcelRoutes = router;
