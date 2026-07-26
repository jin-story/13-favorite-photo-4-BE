import { Router } from "express";

import { protect } from "../../middlewares/auth.js";
import { validate, validateRequest } from "../../middlewares/validate.js";
import exchangeProposalController from "./exchange-proposal.controller.js";
import {
  exchangeProposalIdParamsSchema,
  updateExchangeProposalBodySchema,
} from "./exchange-proposal.schema.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExchangeProposal:
 *       type: object
 *       required: [id, offeredInventory, message, status, createdAt]
 *       properties:
 *         id:
 *           type: integer
 *         offeredInventory:
 *           type: object
 *           required: [photoCard]
 *           properties:
 *             photoCard:
 *               $ref: "#/components/schemas/UserPhotoCard"
 *         message:
 *           type: [string, "null"]
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ExchangeProposalCreateRequest:
 *       type: object
 *       required: [offeredInventoryId]
 *       additionalProperties: false
 *       properties:
 *         offeredInventoryId:
 *           type: integer
 *           minimum: 1
 *         message:
 *           type: string
 *           maxLength: 1000
 *     ExchangeProposalUpdateRequest:
 *       type: object
 *       required: [status]
 *       additionalProperties: false
 *       properties:
 *         status:
 *           type: string
 *           enum: [CANCELED, APPROVED, REJECTED]
 */

/**
 * @swagger
 * /exchange-proposals/{exchangeProposalId}:
 *   patch:
 *     summary: 교환 제안 상태 변경
 *     description: 대기 중인 교환 제안의 상태를 변경합니다. 제안자는 CANCELED로 변경할 수 있으며, 판매자는 APPROVED 또는 REJECTED로 변경할 수 있습니다. APPROVED 처리 시 제안한 카드 1장이 판매자에게, 판매 중인 카드 1장이 제안자에게 이전되고 판매글의 남은 수량이 1 감소하며, 남은 수량이 0이면 판매글이 SOLD로 변경됩니다. APPROVED 또는 REJECTED 처리 성공 시 제안자에게 각각 EXCHANGE_PROPOSAL_APPROVED 또는 EXCHANGE_PROPOSAL_REJECTED 알림이 생성됩니다. 승인·거절의 상태 변경과 관련 카드·판매 수량 변경 및 알림 생성은 각각 동일한 DB 트랜잭션으로 처리됩니다.
 *     tags:
 *       - ExchangeProposal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exchangeProposalId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ExchangeProposalUpdateRequest"
 *     responses:
 *       200:
 *         description: 교환 제안 상태 변경 성공. APPROVED이면 카드 교환과 판매 수량 변경 및 EXCHANGE_PROPOSAL_APPROVED 알림 생성이, REJECTED이면 EXCHANGE_PROPOSAL_REJECTED 알림 생성이 상태 변경과 동일한 DB 트랜잭션으로 처리됩니다. CANCELED이면 알림 없이 상태만 변경됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExchangeProposal"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 상태 변경 권한이 없음
 *       404:
 *         description: 교환 제안을 찾을 수 없음
 *       409:
 *         description: 교환 제안 또는 판매글 상태 충돌
 */
router.patch(
  "/:exchangeProposalId",
  protect,
  validateRequest({ params: exchangeProposalIdParamsSchema }),
  validate(updateExchangeProposalBodySchema),
  exchangeProposalController.updateExchangeProposal,
);

export default router;
