// src/routes/index.js
import { Router } from "express";
import authRouter from "../modules/auth/auth.route.js";
import photoCardRouter from "../modules/photo-card/photo-card.route.js";
import userRouter from "../modules/user/user.route.js";

const router = Router();

// 각 모듈 라우터 연결 (구현되는 순서대로 추가)
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/photo-cards", photoCardRouter);

export default router;
