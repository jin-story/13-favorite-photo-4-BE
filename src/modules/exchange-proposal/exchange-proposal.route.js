import { Router } from "express";

import { protect } from "../../common/middlewares/auth.js";
import {
  validate,
  validateRequest,
} from "../../common/middlewares/validate.js";
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
 *     description: 대기 중인 교환 제안의 상태를 변경합니다. 제안자는 제안을 취소할 수 있으며, 판매자는 제안을 승인하거나 거절할 수 있습니다. 승인 또는 거절이 완료되면 제안자에게 처리 결과 알림이 생성됩니다.
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
 *         description: 교환 제안 상태 변경 성공. 승인 시 카드 교환과 판매 수량 변경이 함께 처리되며, 승인 또는 거절 결과에 맞는 알림이 제안자에게 생성됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ExchangeProposal"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         description: 상태 변경 권한이 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: 교환 제안을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 교환 제안 또는 판매글 상태 충돌, 제안 카드 보유 수량 부족
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/:exchangeProposalId",
  protect,
  validateRequest({ params: exchangeProposalIdParamsSchema }),
  validate(updateExchangeProposalBodySchema),
  exchangeProposalController.updateExchangeProposal,
);

export default router;
