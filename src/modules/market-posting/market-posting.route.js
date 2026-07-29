import { Router } from "express";

import { protect } from "../../common/middlewares/auth.js";
import {
  validate,
  validateRequest,
} from "../../common/middlewares/validate.js";
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
 *       required: [id, nickname]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nickname:
 *           type: string
 *           example: "seller-master"
 *     MarketPosting:
 *       type: object
 *       required: [id, sellerId, seller, userInventoryId, photoCard, price, quantity, remainingQuantity, title, description, exchangeGrade, exchangeGenre, exchangeDescription, status, createdAt, updatedAt]
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
 *           type: [string, "null"]
 *           example: "Winter Special Card 판매"
 *         description:
 *           type: [string, "null"]
 *           example: "상태 좋은 포토카드입니다."
 *         exchangeGrade:
 *           type: [string, "null"]
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY, null]
 *           example: "RARE"
 *         exchangeGenre:
 *           type: [string, "null"]
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
 *             - null
 *           example: "SPECIAL"
 *         exchangeDescription:
 *           type: [string, "null"]
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
 *       additionalProperties: false
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
 *           pattern: '\S'
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
 *       additionalProperties: false
 *       minProperties: 1
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
 *           pattern: '\S'
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
 *     MarketPostingDetail:
 *       allOf:
 *         - $ref: "#/components/schemas/MarketPosting"
 *         - type: object
 *           required: [isSeller]
 *           properties:
 *             isSeller:
 *               type: boolean
 *               description: 로그인 사용자가 해당 판매글의 판매자인지 여부
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
 *       required: [id, marketPostingId, buyerId, sellerId, photoCardId, transactionPrice, quantity, totalPrice, remainingQuantity, status, createdAt, updatedAt]
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
 *           enum: [COMPLETED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MarketPostingListResponse:
 *       type: object
 *       required: [list, nextCursor, hasNextPage]
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MarketPosting"
 *         nextCursor:
 *           type: [string, "null"]
 *           description: 다음 페이지 조회에 사용할 불투명 커서. 다음 페이지가 없으면 null입니다.
 *         hasNextPage:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /market-postings:
 *   get:
 *     summary: 전체 판매글 목록 조회
 *     description: 마켓플레이스 판매글을 커서 방식으로 조회합니다. 검색, 등급/장르/품절 여부 필터, 최신/오래된 순 및 낮은/높은 가격 순 정렬이 가능합니다.
 *     tags:
 *       - Marketplace
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           minLength: 1
 *           pattern: '\S'
 *         description: 이전 응답의 nextCursor. 정렬 조건을 바꾸면 기존 커서를 재사용할 수 없습니다.
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
 *         description: true이면 품절, false이면 판매 가능한 판매글만 조회합니다. 미전달 시 모두 조회합니다.
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
 *       400:
 *         $ref: "#/components/responses/BadRequest"
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
 *     description: 로그인 사용자가 보유한 포토카드를 판매글로 등록합니다. 판매 등록 수량은 사용자의 보유 수량에서 차감되며, 같은 수량이 판매글의 초기 잔여 수량으로 설정됩니다. 판매글 생성과 보유 수량 차감은 동일한 DB 트랜잭션으로 처리됩니다.
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
 *         description: 판매글 등록 성공. 등록 수량만큼 보유 수량이 차감되며, 판매글 생성과 보유 수량 차감은 동일한 DB 트랜잭션으로 처리됩니다.
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
 *         description: 판매 등록 가능한 보유 수량이 부족합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
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
 *     description: 판매 중인 포토카드를 구매합니다. 구매가 완료되면 구매자와 판매자에게 알림이 생성됩니다.
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
 *         description: 포토카드 구매 성공. 구매자에게 TRANSACTION_COMPLETED 알림이 생성되고, 판매자에게 남은 수량에 따라 MARKET_POSTING_SOLD 또는 MARKET_POSTING_SOLD_OUT 알림이 생성됩니다. 구매 처리와 거래·알림 생성은 동일한 DB 트랜잭션으로 처리됩니다.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 본인 판매글, 포인트 또는 판매 수량 충돌
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
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
 *     description: 판매 중인 포토카드에 교환 제안을 생성합니다. 교환 제안 생성이 성공하면 해당 판매글의 판매자에게 EXCHANGE_PROPOSAL_RECEIVED 타입의 알림이 생성됩니다. 교환 제안과 알림 생성은 동일한 DB 트랜잭션으로 처리됩니다.
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
 *             $ref: "#/components/schemas/ExchangeProposalCreateRequest"
 *     responses:
 *       201:
 *         description: 교환 제안 생성 성공. 판매자에게 EXCHANGE_PROPOSAL_RECEIVED 알림이 생성되며, 교환 제안과 알림 생성은 동일한 DB 트랜잭션으로 처리됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExchangeProposal"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: 판매글 또는 보유 포토카드를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 교환을 제안할 수 없는 판매글
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *   get:
 *     summary: 들어온 교환 제안 목록 조회
 *     description: 판매자 본인이 해당 판매글에 들어온 교환 제안을 생성일 내림차순으로 조회합니다.
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
 *       200:
 *         description: 교환 제안 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ExchangeProposal"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         description: 판매자 본인이 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: 판매글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
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
 *     description: 로그인한 사용자가 판매글 상세 정보를 조회합니다. 응답에는 로그인 사용자가 해당 판매글의 판매자인지 여부가 포함됩니다.
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
 *       200:
 *         description: 판매글 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPostingDetail"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: 판매글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/:marketPostingId",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  marketPostingController.getMarketPosting,
);

/**
 * @swagger
 * /market-postings/{marketPostingId}:
 *   patch:
 *     summary: 판매글 수정
 *     description: 판매자 본인만 판매 중인 판매글의 수량, 가격, 설명, 교환 희망 조건을 수정할 수 있습니다. 수량이 변경되면 이미 판매된 수량을 제외한 차이만큼 판매자의 보유 수량도 같은 DB 트랜잭션에서 차감되거나 복구됩니다.
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
 *         description: 판매글 수정 성공. 수량 변경이 있으면 판매자의 보유 수량 변경도 동일한 DB 트랜잭션으로 처리됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MarketPosting"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         description: 판매자 본인이 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: 판매글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 판매글 수량 또는 상태 충돌
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
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
 *     description: 판매자 본인만 판매 중인 판매글을 내릴 수 있습니다. 남은 판매 수량은 판매자의 보유 수량으로 복구됩니다.
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
 *         description: 판매글 내리기 성공. 남은 판매 수량이 판매자의 보유 수량으로 동일한 DB 트랜잭션에서 복구됩니다.
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         description: 판매자 본인이 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: 판매글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 판매 중인 판매글이 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.delete(
  "/:marketPostingId",
  protect,
  validateRequest({ params: marketPostingIdParamsSchema }),
  marketPostingController.cancelMarketPosting,
);

export default router;
