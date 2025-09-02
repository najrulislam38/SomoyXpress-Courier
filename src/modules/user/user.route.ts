import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import {
  createSenderUserZodSchema,
  updateUserZodSchema,
} from "./user.validation";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequestUseZod(createSenderUserZodSchema),
  UserController.createUser
);

router.get("/me", withAuth(...Object.values(UserRole)), UserController.getMe);

router.patch(
  "/me",
  withAuth(...Object.values(UserRole)),
  UserController.updateMe
);

router.get(
  "/",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.getAllUsers
);
router.get(
  "/all-receiver",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SENDER),
  UserController.getAllReceiver
);

router.get(
  "/:id",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.getSingleUser
);
router.patch(
  "/:id",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequestUseZod(updateUserZodSchema),
  UserController.updateUser
);

router.patch(
  "/block/:id",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.blockUser
);

router.patch(
  "/:id/delete",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.DeleteUser
);

router.patch(
  "/unblock/:id",
  withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.unBlockUser
);

export const UserRoutes = router;
