import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  withAuth(UserRole.SENDER),
  ParcelController.createParcel
);

export const ParcelRoutes = router;
