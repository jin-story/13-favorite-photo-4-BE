import { Router } from "express";
import userController from "./user.controller.js";
import { protect } from "../../middlewares/auth.js";

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 보유 수량이 1개 이상인 카드 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, photoCardId, ownedQuantity, photoCard]
 *                 properties:
 *                   id:
 *                     type: integer
 *                   photoCardId:
 *                     type: integer
 *                   ownedQuantity:
 *                     type: integer
 *                   photoCard:
 *                     $ref: '#/components/schemas/UserPhotoCard'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
userRouter.get("/me/inventories", protect, userController.getMyInventories);

/**
 * @swagger
 * /users/me/exchange-proposals:
 *   get:
 *     tags: [User]
 *     summary: 내가 제시한 교환 목록 조회
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
 *                 required: [id, status, createdAt, offeredInventory]
 *                 properties:
 *                   id:
 *                     type: integer
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
  userController.markNotificationAsRead,
);

export default userRouter;
