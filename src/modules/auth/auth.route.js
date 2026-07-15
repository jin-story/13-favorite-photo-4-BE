import { Router } from "express";
import authController from "./auth.controller.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { userCreateSchema, loginSchema } from "./auth.schema.js";

const authRouter = Router();

function verifyOrigin(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
  if (!origin || origin !== allowedOrigin) {
    const error = new Error("허용되지 않은 요청 출처입니다.");
    error.status = 403;
    return next(error);
  }
  next();
}

authRouter.get("/me", protect, authController.getMe);
authRouter.post("/signup", validate(userCreateSchema), authController.signup);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/refresh-token", verifyOrigin, authController.refreshToken);
authRouter.post("/logout", protect, authController.logout);

export default authRouter;
