import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const exchangeProposalIdParamsSchema = z.object({
  exchangeProposalId: positiveInt,
});

export const createExchangeProposalBodySchema = z
  .object({
    offeredInventoryId: positiveInt,
    message: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateExchangeProposalBodySchema = z
  .object({
    status: z.enum(["CANCELED", "APPROVED", "REJECTED"]),
  })
  .strict();
