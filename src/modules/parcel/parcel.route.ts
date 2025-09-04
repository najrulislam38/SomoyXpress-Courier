import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "../user/user.interface";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import { crateParcelZodSchema } from "./parcel.validation";

const router = Router();

router.post(
  "/create",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequestUseZod(crateParcelZodSchema),
  ParcelController.createParcel
);
router.get(
  "/",
  withAuth(...Object.values(UserRole)),
  ParcelController.getAllParcel
);

router.get("/track/:trackingId", ParcelController.parcelTracking);

router.patch(
  "/:id/update-status",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.updateParcelStatus
);

router.patch(
  "/:id/cancel",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.cancelParcel
);

router.get(
  "/incoming-parcel",
  withAuth(UserRole.RECEIVER),
  ParcelController.getIncomingParcel
);

router.get(
  "/delivery-history",
  withAuth(UserRole.RECEIVER),
  ParcelController.getParcelDeliveryHistory
);

router.get(
  "/:id",
  withAuth(...Object.values(UserRole)),
  ParcelController.getSingleParcel
);

router.patch(
  "/:id/confirm",
  withAuth(UserRole.RECEIVER),
  ParcelController.confirmParcel
);

router.delete(
  "/:id/delete",
  withAuth(UserRole.SENDER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.deleteParcel
);

export const ParcelRoutes = router;
