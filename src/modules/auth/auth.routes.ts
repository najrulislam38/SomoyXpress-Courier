import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/login", AuthController.credentialLogin);
router.post("/agent/login", AuthController.credentialLoginForAgent);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.getNewAccessTokenUseRefreshToken);

export const AuthRoutes = router;
