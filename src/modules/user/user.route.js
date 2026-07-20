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

userRouter.get("/me/notifications", protect, userController.getMyNotifications);

export default userRouter;
