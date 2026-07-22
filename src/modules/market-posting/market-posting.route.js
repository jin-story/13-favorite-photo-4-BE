import { Router } from "express";

import { protect } from "../../middlewares/auth.js";
import { validate, validateRequest } from "../../middlewares/validate.js";
import exchangeProposalController from "../exchange-proposal/exchange-proposal.controller.js";
import { createExchangeProposalBodySchema } from "../exchange-proposal/exchange-proposal.schema.js";
import * as marketPostingController from "./market-posting.controller.js";
import {
  createMarketPostingBodySchema,
  listMarketPostingsQuerySchema,
  marketPostingIdParamsSchema,
  purchaseMarketPostingBodySchema,
  updateMarketPostingBodySchema,
} from "./market-posting.schema.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MarketPostingSeller:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nickname:
 *           type: string
 *           example: "seller-master"
 *     MarketPosting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         sellerId:
 *           type: integer
 *           example: 1
 *         seller:
 *           $ref: "#/components/schemas/MarketPostingSeller"
 *         userInventoryId:
 *           type: integer
 *           example: 1
 *         photoCard:
 *           $ref: "#/components/schemas/PhotoCard"
 *         price:
 *           type: integer
 *           example: 1000
 *         quantity:
 *           type: integer
 *           example: 5
 *         remainingQuantity:
 *           type: integer
 *           description: 판매글에서 아직 판매되지 않은 남은 수량
 *           example: 3
 *         title:
 *           type: string
 *           example: "Winter Special Card 판매"
 *         description:
 *           type: string
 *           example: "상태 좋은 포토카드입니다."
 *         exchangeGrade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *           nullable: true
 *           example: "RARE"
 *         exchangeGenre:
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
 *           nullable: true
 *           example: "SPECIAL"
 *         exchangeDescription:
 *           type: string
 *           nullable: true
 *           example: "RARE 이상 카드와 교환 희망"
 *         status:
 *           type: string
 *           enum: [ON_SALE, SOLD]
 *           example: "ON_SALE"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MarketPostingCreateRequest:
 *       type: object
 *       required:
 *         - userInventoryId
 *         - quantity
 *         - price
 *       properties:
 *         userInventoryId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *         price:
 *           type: integer
 *           minimum: 1
 *           example: 1000
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Winter Special Card 판매"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "상태 좋은 포토카드입니다."
 *         exchangeGrade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *         exchangeGenre:
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
 *         exchangeDescription:
 *           type: string
 *           maxLength: 1000
 *           example: "RARE 이상 카드와 교환 희망"
 *     MarketPostingUpdateRequest:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *         price:
 *           type: integer
 *           minimum: 1
 *           example: 1200
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Winter Special Card 판매"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "가격을 조정했습니다."
 *         exchangeGrade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *         exchangeGenre:
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
 *         exchangeDescription:
 *           type: string
 *           maxLength: 1000
 *           example: "SUPER_RARE 카드와 교환 희망"
 *     MarketPostingPurchaseRequest:
 *       type: object
 *       required: [quantity]
 *       additionalProperties: false
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *     MarketPostingTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         marketPostingId:
 *           type: integer
 *         buyerId:
 *           type: integer
 *         sellerId:
 *           type: integer
 *         photoCardId:
 *           type: integer
 *         transactionPrice:
 *           type: integer
 *           description: 포토카드 1장당 거래 가격
 *         quantity:
 *           type: integer
 *         totalPrice:
 *           type: integer
 *           description: 총 결제 포인트
 *         remainingQuantity:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [COMPLETED, CANCELED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MarketPostingListResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MarketPosting"
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
 * /market-postings:
 *   get:
 *     summary: 전체 판매글 목록 조회
 *     description: 마켓플레이스에 등록된 판매 중인 포토카드 목록을 조회합니다. 검색, 등급/장르 필터, 최신/오래된 순 및 낮은/높은 가격 순 정렬이 가능합니다.
 *     tags:
 *       - Marketplace
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
 *         description: 판매글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPostingListResponse"
 */
router.get(
  "/",
  validateRequest({ query: listMarketPostingsQuerySchema }),
  marketPostingController.listMarketPostings,
);

/**
 * @swagger
 * /market-postings:
 *   post:
 *     summary: 판매글 등록
 *     description: 로그인 사용자가 기존에 보유한 포토카드를 판매글로 등록합니다. 등록 수량만큼 UserInventory.ownedQuantity가 차감되고, remainingQuantity는 등록 수량으로 설정됩니다.
 *     tags:
 *       - Marketplace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MarketPostingCreateRequest"
 *     responses:
 *       201:
 *         description: 판매글 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPosting"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: 판매 가능한 보유 포토카드를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         $ref: "#/components/responses/Conflict"
 */
router.post(
  "/",
  protect,
  validate(createMarketPostingBodySchema),
  marketPostingController.createMarketPosting,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}/transactions:
 *   post:
 *     summary: 포토카드 구매
 *     description: 판매 중인 포토카드를 구매합니다. 구매자의 포인트를 차감하고 판매자의 포인트와 구매자의 보유 수량을 증가시킵니다.
 *     tags:
 *       - Marketplace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MarketPostingPurchaseRequest"
 *     responses:
 *       201:
 *         description: 포토카드 구매 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPostingTransaction"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: 판매글을 찾을 수 없음
 *       409:
 *         description: 본인 판매글, 포인트 또는 판매 수량 충돌
 */
router.post(
  "/:marketPostingId/transactions",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  validate(purchaseMarketPostingBodySchema),
  marketPostingController.purchaseMarketPosting,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}/exchange-proposals:
 *   post:
 *     summary: 교환 제안 생성
 *     tags:
 *       - ExchangeProposal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ExchangeProposalCreateRequest"
 *     responses:
 *       201:
 *         description: 교환 제안 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExchangeProposal"
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 판매글 또는 보유 포토카드를 찾을 수 없음
 *       409:
 *         description: 교환을 제안할 수 없는 판매글
 *   get:
 *     summary: 들어온 교환 제안 목록 조회
 *     tags:
 *       - ExchangeProposal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: 교환 제안 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ExchangeProposal"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 판매자 본인이 아님
 *       404:
 *         description: 판매글을 찾을 수 없음
 */
router.post(
  "/:marketPostingId/exchange-proposals",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  validate(createExchangeProposalBodySchema),
  exchangeProposalController.createExchangeProposal,
);

router.get(
  "/:marketPostingId/exchange-proposals",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  exchangeProposalController.listExchangeProposals,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}:
 *   get:
 *     summary: 판매글 상세 조회
 *     description: 마켓플레이스에 등록된 포토카드 판매글 상세 정보를 조회합니다.
 *     tags:
 *       - Marketplace
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: 판매글 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPosting"
 *       404:
 *         description: 판매글을 찾을 수 없음
 */
router.get(
  "/:marketPostingId",
  validateRequest({ params: marketPostingIdParamsSchema }),
  marketPostingController.getMarketPosting,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}:
 *   patch:
 *     summary: 판매글 수정
 *     description: 판매자 본인만 판매 중인 판매글의 수량, 가격, 설명, 교환 희망 조건을 수정할 수 있습니다.
 *     tags:
 *       - Marketplace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MarketPostingUpdateRequest"
 *     responses:
 *       200:
 *         description: 판매글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPosting"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 판매자 본인이 아님
 *       404:
 *         description: 판매글을 찾을 수 없음
 *       409:
 *         description: 판매글 수량 또는 상태 충돌
 */
router.patch(
  "/:marketPostingId",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  validate(updateMarketPostingBodySchema),
  marketPostingController.updateMarketPosting,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}:
 *   delete:
 *     summary: 판매글 내리기
 *     description: 판매자 본인만 판매 중인 판매글을 내릴 수 있습니다. 남은 판매 수량은 UserInventory.ownedQuantity로 복구됩니다.
 *     tags:
 *       - Marketplace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketPostingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       204:
 *         description: 판매글 내리기 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 판매자 본인이 아님
 *       404:
 *         description: 판매글을 찾을 수 없음
 *       409:
 *         description: 판매 중인 판매글이 아님
 */
router.delete(
  "/:marketPostingId",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  marketPostingController.cancelMarketPosting,
);

export default router;
