import { Router } from "express";
import pointDrawController from "./point-draw.controller.js";
import { protect } from "../../middlewares/auth.js";

const pointDrawRouter = Router();

/**
 * @swagger
 * /point-draws:
 *   get:
 *     tags: [PointDraw]
 *     summary: 다음 포인트 뽑기 가능 여부 및 남은 시간 조회
 *     description: 로그인 사용자의 최근 포인트 뽑기 기록을 기준으로 다음 뽑기 상태를 계산합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 포인트 뽑기 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - canDraw
 *                 - nextAvailableAt
 *                 - remainingSeconds
 *               properties:
 *                 canDraw:
 *                   type: boolean
 *                   example: false
 *                 nextAvailableAt:
 *                   type:
 *                     - string
 *                     - "null"
 *                   format: date-time
 *                   example: "2026-07-21T15:00:00.000Z"
 *                 remainingSeconds:
 *                   type: integer
 *                   minimum: 0
 *                   example: 3599
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
pointDrawRouter.get("/", protect, pointDrawController.getDrawStatus);

pointDrawRouter.post("/", protect, pointDrawController.drawPoint);
export default pointDrawRouter;
