import { Router } from "express";

import { protect } from "../../middlewares/auth.js";
import { validate, validateRequest } from "../../middlewares/validate.js";
import * as photoCardController from "./photo-card.controller.js";
import {
  createPhotoCardBodySchema,
  photoCardIdParamsSchema,
  listPhotoCardsQuerySchema,
  listMyPhotoCardsQuerySchema,
} from "./photo-card.schema.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PhotoCardCreator:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nickname:
 *           type: string
 *           example: "card-master"
 *     PhotoCard:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         creatorId:
 *           type: integer
 *           example: 1
 *         creator:
 *           $ref: "#/components/schemas/PhotoCardCreator"
 *         name:
 *           type: string
 *           example: "Winter Special Card"
 *         grade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *           example: "RARE"
 *         genre:
 *           type: string
 *           enum:
 *             - ALBUM
 *             - SPECIAL
 *             - FAN_SIGN
 *             - SEASON_GREETING
 *             - FAN_MEETING
 *             - CONCERT
 *             - MD
 *             - COLLABORATION
 *             - FAN_CLUB
 *             - ETC
 *           example: "SPECIAL"
 *         minPrice:
 *           type: integer
 *           example: 1000
 *         description:
 *           type: string
 *           example: "Winter special photocard"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/photo-card.png"
 *         totalQuantity:
 *           type: integer
 *           example: 10
 *         ownedQuantity:
 *           type: integer
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PhotoCardCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - grade
 *         - genre
 *         - minPrice
 *         - description
 *         - imageUrl
 *         - totalQuantity
 *       properties:
 *         name:
 *           type: string
 *           example: "Winter Special Card"
 *         grade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *           example: "RARE"
 *         genre:
 *           type: string
 *           enum:
 *             - ALBUM
 *             - SPECIAL
 *             - FAN_SIGN
 *             - SEASON_GREETING
 *             - FAN_MEETING
 *             - CONCERT
 *             - MD
 *             - COLLABORATION
 *             - FAN_CLUB
 *             - ETC
 *           example: "SPECIAL"
 *         minPrice:
 *           type: integer
 *           minimum: 1
 *           example: 1000
 *         description:
 *           type: string
 *           example: "Winter special photocard"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/photo-card.png"
 *         totalQuantity:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *     PhotoCardListResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/PhotoCard"
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 */

/**
 * @swagger
 * /photo-cards:
 *   post:
 *     summary: 포토카드 생성
 *     tags:
 *       - PhotoCards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PhotoCardCreateRequest"
 *     responses:
 *       201:
 *         description: 포토카드 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PhotoCard"
 *       401:
 *         description: 인증 실패
 */
router.post(
  "/",
  protect,
  validate(createPhotoCardBodySchema),
  photoCardController.createPhotoCard,
);

/**
 * @swagger
 * /photo-cards:
 *   get:
 *     summary: 포토카드 목록 조회
 *     tags:
 *       - PhotoCards
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum:
 *             - ALBUM
 *             - SPECIAL
 *             - FAN_SIGN
 *             - SEASON_GREETING
 *             - FAN_MEETING
 *             - CONCERT
 *             - MD
 *             - COLLABORATION
 *             - FAN_CLUB
 *             - ETC
 *       - in: query
 *         name: soldOut
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, price_asc, price_desc]
 *           default: recent
 *     responses:
 *       200:
 *         description: 포토카드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PhotoCardListResponse"
 */
router.get(
  "/",
  validateRequest({ query: listPhotoCardsQuerySchema }),
  photoCardController.listPhotoCards,
);

/**
 * @swagger
 * /photo-cards/me:
 *   get:
 *     summary: 내 포토카드 목록 조회
 *     tags:
 *       - PhotoCards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum:
 *             - ALBUM
 *             - SPECIAL
 *             - FAN_SIGN
 *             - SEASON_GREETING
 *             - FAN_MEETING
 *             - CONCERT
 *             - MD
 *             - COLLABORATION
 *             - FAN_CLUB
 *             - ETC
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, price_asc, price_desc]
 *           default: recent
 *     responses:
 *       200:
 *         description: 내 포토카드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PhotoCardListResponse"
 *       401:
 *         description: 인증 실패
 */
router.get(
  "/me",
  protect,
  validateRequest({ query: listMyPhotoCardsQuerySchema }),
  photoCardController.listMyPhotoCards,
);

/**
 * @swagger
 * /photo-cards/{photoCardId}:
 *   get:
 *     summary: 포토카드 상세 조회
 *     tags:
 *       - PhotoCards
 *     parameters:
 *       - in: path
 *         name: photoCardId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: 포토카드 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PhotoCard"
 *       404:
 *         description: 포토카드를 찾을 수 없음
 */
router.get(
  "/:photoCardId",
  validateRequest({ params: photoCardIdParamsSchema }),
  photoCardController.getPhotoCard,
);

export default router;
