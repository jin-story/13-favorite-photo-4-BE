import { Router } from "express";
import userController from "./user.controller.js";
import { protect } from "../../common/middlewares/auth.js";
import { validateRequest } from "../../common/middlewares/validate.js";
import {
  getMyInventoriesQuerySchema,
  markNotificationAsReadParamsSchema,
} from "./user.schema.js";

const userRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPhotoCard:
 *       type: object
 *       required: [id, name, grade, genre, minPrice, imageUrl, creator]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         grade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *         genre:
 *           type: string
 *           enum: [ALBUM, SPECIAL, FAN_SIGN, SEASON_GREETING, FAN_MEETING, CONCERT, MD, COLLABORATION, FAN_CLUB, ETC]
 *         minPrice:
 *           type: integer
 *         imageUrl:
 *           type: string
 *         creator:
 *           type: object
 *           required: [nickname]
 *           properties:
 *             nickname:
 *               type: string
 *     Notification:
 *       type: object
 *       required: [id, type, message, isRead, readAt, createdAt]
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [TRANSACTION_COMPLETED, MARKET_POSTING_SOLD, MARKET_POSTING_SOLD_OUT, EXCHANGE_PROPOSAL_RECEIVED, EXCHANGE_PROPOSAL_APPROVED, EXCHANGE_PROPOSAL_REJECTED]
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *         readAt:
 *           type: [string, "null"]
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [User]
 *     summary: 내 정보 조회
 *     description: Bearer 액세스 토큰으로 인증된 현재 사용자 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 현재 로그인한 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/me", protect, userController.getMe);
/**
 * @swagger
 * /users/me/inventories:
 *   get:
 *     tags: [User]
 *     summary: 내 보유 카드 목록 조회
 *     description: 보유 수량이 1개 이상인 포토카드를 ID 내림차순의 커서 방식으로 조회합니다. 이름·등급·장르로 필터링할 수 있으며, includeMeta가 true이면 사용자 정보와 필터와 무관한 전체 보유 카드 수량·등급별 요약을 포함합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         description: 포토카드 이름 검색어
 *         schema:
 *           type: string
 *           minLength: 1
 *           pattern: '\S'
 *       - in: query
 *         name: grade
 *         required: false
 *         description: 포토카드 등급
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *       - in: query
 *         name: genre
 *         required: false
 *         description: 포토카드 장르
 *         schema:
 *           type: string
 *           enum: [ALBUM, SPECIAL, FAN_SIGN, SEASON_GREETING, FAN_MEETING, CONCERT, MD, COLLABORATION, FAN_CLUB, ETC]
 *       - in: query
 *         name: cursor
 *         required: false
 *         description: 이전 응답의 nextCursor
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: 조회할 보유 카드 개수
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 15
 *       - in: query
 *         name: includeMeta
 *         required: false
 *         description: 사용자와 전체 보유 카드 요약 정보 포함 여부
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: 내 보유 카드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: includeMeta가 false이거나 생략된 경우
 *                   required: [list, nextCursor, hasNextPage]
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [id, photoCardId, ownedQuantity, photoCard]
 *                         properties:
 *                           id:
 *                             type: integer
 *                           photoCardId:
 *                             type: integer
 *                           ownedQuantity:
 *                             type: integer
 *                           photoCard:
 *                             $ref: '#/components/schemas/UserPhotoCard'
 *                     nextCursor:
 *                       type: [integer, "null"]
 *                     hasNextPage:
 *                       type: boolean
 *                 - type: object
 *                   description: includeMeta가 true인 경우
 *                   required: [user, summary, list, nextCursor, hasNextPage]
 *                   properties:
 *                     user:
 *                       type: object
 *                       required: [id, nickname]
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nickname:
 *                           type: string
 *                     summary:
 *                       type: object
 *                       required: [totalQuantity, gradeCounts]
 *                       properties:
 *                         totalQuantity:
 *                           type: integer
 *                         gradeCounts:
 *                           type: object
 *                           required: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                           properties:
 *                             COMMON:
 *                               type: integer
 *                             RARE:
 *                               type: integer
 *                             SUPER_RARE:
 *                               type: integer
 *                             LEGENDARY:
 *                               type: integer
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [id, photoCardId, ownedQuantity, photoCard]
 *                         properties:
 *                           id:
 *                             type: integer
 *                           photoCardId:
 *                             type: integer
 *                           ownedQuantity:
 *                             type: integer
 *                           photoCard:
 *                             $ref: '#/components/schemas/UserPhotoCard'
 *                     nextCursor:
 *                       type: [integer, "null"]
 *                     hasNextPage:
 *                       type: boolean
 *       '400':
 *         description: 쿼리 파라미터가 올바르지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               path: /users/me/inventories
 *               method: GET
 *               status: 400
 *               code: INVALID_REQUEST
 *               message: 커서는 양의 정수여야 합니다.
 *               date: "2026-07-24T00:00:00.000Z"
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         description: 인증된 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               path: /users/me/inventories
 *               method: GET
 *               status: 404
 *               code: USER_NOT_FOUND
 *               message: 존재하지 않는 유저입니다.
 *               date: "2026-07-24T00:00:00.000Z"
 */
userRouter.get(
  "/me/inventories",
  protect,
  validateRequest({
    query: getMyInventoriesQuerySchema,
  }),
  userController.getMyInventories,
);

/**
 * @swagger
 * /users/me/exchange-proposals:
 *   get:
 *     tags: [User]
 *     summary: 내가 제시한 교환 목록 조회
 *     description: 로그인 사용자가 제안자로 생성한 교환 제안을 생성일 내림차순으로 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 생성일 내림차순으로 정렬된 교환 제안 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, marketPostingId, message, status, createdAt, offeredInventory]
 *                 properties:
 *                   id:
 *                     type: integer
 *                   marketPostingId:
 *                     type: integer
 *                     description: 교환을 요청한 판매글 ID
 *                   message:
 *                     type: [string, "null"]
 *                   status:
 *                     type: string
 *                     enum: [PENDING, APPROVED, REJECTED, CANCELED]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   offeredInventory:
 *                     type: object
 *                     required: [photoCard]
 *                     properties:
 *                       photoCard:
 *                         $ref: '#/components/schemas/UserPhotoCard'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
userRouter.get(
  "/me/exchange-proposals",
  protect,
  userController.getMyExchangeProposals,
);

/**
 * @swagger
 * /users/me/market-postings:
 *   get:
 *     tags: [User]
 *     summary: 나의 판매 포토카드 목록 조회
 *     description: 로그인 사용자가 판매자로 등록한 삭제되지 않은 판매글을 생성일과 ID 내림차순으로 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 생성일과 ID 내림차순으로 정렬된 나의 판매 포토카드 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, price, quantity, remainingQuantity, status, createdAt, userInventory]
 *                 properties:
 *                   id:
 *                     type: integer
 *                   price:
 *                     type: integer
 *                   quantity:
 *                     type: integer
 *                   remainingQuantity:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [ON_SALE, SOLD]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   userInventory:
 *                     type: object
 *                     required: [id, ownedQuantity, photoCard]
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ownedQuantity:
 *                         type: integer
 *                       photoCard:
 *                         $ref: '#/components/schemas/UserPhotoCard'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
userRouter.get(
  "/me/market-postings",
  protect,
  userController.getMyMarketPostings,
);

/**
 * @swagger
 * /users/me/notifications:
 *   get:
 *     tags: [User]
 *     summary: 내 알림 목록 조회
 *     description: createdAt 내림차순으로 정렬하며, createdAt이 같으면 id 내림차순으로 정렬합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
userRouter.get("/me/notifications", protect, userController.getMyNotifications);

/**
 * @swagger
 * /users/me/notifications/{notificationId}:
 *   patch:
 *     tags: [User]
 *     summary: 내 알림 읽음 처리
 *     description: 읽지 않은 알림은 isRead를 true로 변경하고 readAt을 기록합니다. 이미 읽은 알림은 기존 readAt을 유지하며, 본인 소유 알림만 수정할 수 있습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       '400':
 *         description: notificationId가 올바르지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: 다른 사용자의 알림은 수정할 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 알림을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.patch(
  "/me/notifications/:notificationId",
  protect,
  validateRequest({
    params: markNotificationAsReadParamsSchema,
  }),
  userController.markNotificationAsRead,
);

/**
 * @swagger
 * /users/me/notifications/subscribe:
 *   get:
 *     tags: [User]
 *     summary: 실시간 알림 구독
 *     description: |
 *       Bearer 액세스 토큰으로 인증한 뒤 SSE 연결을 열고 유지합니다.
 *       각 알림은 `data: {JSON}\n\n` 형식으로 전달됩니다.
 *       Swagger UI의 Try it out은 장시간 연결을 유지하는 SSE 테스트에 적합하지 않습니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: SSE 연결을 열고 유지하며 실시간 알림을 전송합니다.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: '`data: {JSON}\n\n` 형식의 SSE 알림 스트림'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
userRouter.get(
  "/me/notifications/subscribe",
  protect,
  userController.subscribeNotifications,
);

export default userRouter;
