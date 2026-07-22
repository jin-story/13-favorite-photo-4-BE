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
 *       properties:
 *         id:
 *           type: integer
 *         offeredInventory:
 *           type: object
 *           properties:
 *             photoCard:
 *               $ref: "#/components/schemas/UserPhotoCard"
 *         message:
 *           type: string
 *           nullable: true
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
 *     description: 제안자는 대기 중인 제안을 취소할 수 있고, 판매자는 대기 중인 제안을 승인하거나 거절할 수 있습니다.
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
 *         description: 교환 제안 상태 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExchangeProposal"
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
