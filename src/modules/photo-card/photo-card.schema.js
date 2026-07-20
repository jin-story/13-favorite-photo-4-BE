import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const gradeSchema = z.enum(["COMMON", "RARE", "SUPER_RARE", "LEGENDARY"]);

export const genreSchema = z.enum([
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

export const createPhotoCardBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    grade: gradeSchema,
    genre: genreSchema,
    minPrice: positiveInt,
    description: z.string().trim().min(1).max(1000),
    imageUrl: z.string().trim().url(),
    totalQuantity: positiveInt,
  })
  .strict();

export const listMyPhotoCardsQuerySchema = z.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
  keyword: z.string().trim().optional(),
  grade: gradeSchema.optional(),
  genre: genreSchema.optional(),
  sort: z.enum(["recent", "oldest", "price_asc", "price_desc"]).default("recent"),
});
