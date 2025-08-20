import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequestUseZod(createUserZodSchema),
  UserController.createUser
);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getSingleUser);
router.patch("/:id", UserController.updateUser);

export const UserRoutes = router;
