import express from "express";
import { ContactController } from "./contact.controller";
import { contactMailValidation } from "./contact.validation";
import { validateRequestUseZod } from "../../middleware/validateRequestUseZod";
import { withAuth } from "../../middleware/withAuth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.get(
  "/",
  withAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ContactController.getAllMail
);

router.post(
  "/send-mail",
  validateRequestUseZod(contactMailValidation),
  ContactController.getMailFromContact
);

export const ContactRouter = router;
