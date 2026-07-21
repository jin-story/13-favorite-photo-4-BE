import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

const gradeSchema = z.enum(["COMMON", "RARE", "SUPER_RARE", "LEGENDARY"]);
const genreSchema = z.enum([
  "ALBUM",
  "SPECIAL",
  "FAN_SIGN",
  "SEASON_GREETING",
  "FAN_MEETING",
  "CONCERT",
  "MD",
  "COLLABORATION",
  "FAN_CLUB",
  "ETC",
]);

export const marketPostingIdParamsSchema = z.object({
  marketPostingId: positiveInt,
});

export const createMarketPostingBodySchema = z
  .object({
    userInventoryId: positiveInt,
    quantity: positiveInt,
    price: positiveInt,
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    exchangeGrade: gradeSchema.optional(),
    exchangeGenre: genreSchema.optional(),
    exchangeDescription: z.string().trim().max(1000).optional(),
  })
  .strict();

export const purchaseMarketPostingBodySchema = z
  .object({
    quantity: positiveInt,
  })
  .strict();

export const listMarketPostingsQuerySchema = z.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
  keyword: z.string().trim().optional(),
  grade: gradeSchema.optional(),
  genre: genreSchema.optional(),
  sort: z.enum(["recent", "oldest", "price_asc", "price_desc"]).default("recent"),
});

export const updateMarketPostingBodySchema = z
  .object({
    quantity: positiveInt.optional(),
    price: positiveInt.optional(),
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    exchangeGrade: gradeSchema.optional(),
    exchangeGenre: genreSchema.optional(),
    exchangeDescription: z.string().trim().max(1000).optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "수정할 값을 입력해야 합니다.",
  });
