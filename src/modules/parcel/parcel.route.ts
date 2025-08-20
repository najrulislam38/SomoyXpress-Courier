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
  "/track/:trackingId",
  withAuth(UserRole.RECEIVER),
  ParcelController.parcelTracking
);

router.get(
  "/:id",
  withAuth(...Object.values(UserRole)),
  ParcelController.getSingleParcel
);

router.patch(
  "/update-status/:id",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.updateParcelStatus
);

router.patch(
  "/cancel/:id",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.cancelParcel
);

router.patch(
  "/confirm/:id",
  withAuth(UserRole.RECEIVER),
  ParcelController.confirmParcel
);

export const ParcelRoutes = router;
