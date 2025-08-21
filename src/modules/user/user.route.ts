import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequestUseZod(createUserZodSchema),
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

export const UserRoutes = router;
