// src/routes/index.js
import { Router } from "express";
import authRouter from "../modules/auth/auth.route.js";
import marketPostingRouter from "../modules/market-posting/market-posting.route.js";
import photoCardRouter from "../modules/photo-card/photo-card.route.js";
import userRouter from "../modules/user/user.route.js";

import pointDrawRouter from "../modules/point-draw/point-draw.route.js";

const router = Router();

// 각 모듈 라우터 연결 (구현되는 순서대로 추가)
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/photo-cards", photoCardRouter);
router.use("/market-postings", marketPostingRouter);

router.use("/point-draws", pointDrawRouter);

export default router;
