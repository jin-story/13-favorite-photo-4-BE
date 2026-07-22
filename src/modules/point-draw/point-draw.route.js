import { Router } from "express";
import pointDrawController from "./point-draw.controller.js";
import { protect } from "../../middlewares/auth.js";

const pointDrawRouter = Router();

/**
 * @swagger
 * /point-draws:
 *   get:
 *     tags: [Point]
 *     summary: 포인트 뽑기 가능 여부 및 남은 시간 조회
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
 *                 nextAvailableAt:
 *                   type: [string, "null"]
 *                   format: date-time
 *                 remainingSeconds:
 *                   type: integer
 *                   minimum: 0
 *             examples:
 *               firstDraw:
 *                 summary: 최초 사용자
 *                 value:
 *                   canDraw: true
 *                   nextAvailableAt: null
 *                   remainingSeconds: 0
 *               waiting:
 *                 summary: 대기 중인 사용자
 *                 value:
 *                   canDraw: false
 *                   nextAvailableAt: "2026-07-21T15:36:22.417Z"
 *                   remainingSeconds: 300
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Point]
 *     summary: 랜덤 포인트 뽑기 실행
 *     description: 포인트를 무작위로 뽑아 로그인 사용자의 포인트에 적립합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: 포인트 뽑기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - point
 *                 - totalPoints
 *                 - canDraw
 *                 - nextAvailableAt
 *                 - remainingSeconds
 *               properties:
 *                 point:
 *                   type: integer
 *                   description: 이번에 획득한 포인트
 *                 totalPoints:
 *                   type: integer
 *                   description: 적립 후 사용자 전체 포인트
 *                 canDraw:
 *                   type: boolean
 *                 nextAvailableAt:
 *                   type: string
 *                   format: date-time
 *                 remainingSeconds:
 *                   type: integer
 *                   minimum: 0
 *             example:
 *               point: 100
 *               totalPoints: 16400
 *               canDraw: false
 *               nextAvailableAt: "2026-07-21T15:36:22.417Z"
 *               remainingSeconds: 300
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '409':
 *         description: 아직 포인트를 다시 뽑을 수 없거나 트랜잭션 충돌이 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notAvailable:
 *                 summary: 포인트 뽑기 대기 시간 미경과
 *                 value:
 *                   path: /point-draws
 *                   method: POST
 *                   status: 409
 *                   code: POINT_DRAW_NOT_AVAILABLE
 *                   message: 아직 포인트를 다시 뽑을 수 없습니다.
 *                   date: "2026-07-21T14:36:22.417Z"
 *               conflict:
 *                 summary: 포인트 뽑기 트랜잭션 충돌
 *                 value:
 *                   path: /point-draws
 *                   method: POST
 *                   status: 409
 *                   code: POINT_DRAW_CONFLICT
 *                   message: 포인트 뽑기 처리 중 충돌이 발생했습니다. 다시 시도해 주세요.
 *                   date: "2026-07-21T14:36:22.417Z"
 */
pointDrawRouter.get("/", protect, pointDrawController.getDrawStatus);

pointDrawRouter.post("/", protect, pointDrawController.drawPoint);
export default pointDrawRouter;
