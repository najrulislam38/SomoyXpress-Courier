import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequestUseZod } from "../../middleware/validateRequstUseZod";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequestUseZod(createUserZodSchema),
  UserController.createUser
);
router.get("/", UserController.getAllUsers);

export const UserRoutes = router;
