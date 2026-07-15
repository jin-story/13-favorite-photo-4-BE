import { Router } from "express";
import authController from "./auth.controller.js";
import { protect } from "../../middlewares/auth.js";

const authRouter = Router();

authRouter.get("/me", protect, authController.getMe);
authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", protect, authController.logout);

export default authRouter;
