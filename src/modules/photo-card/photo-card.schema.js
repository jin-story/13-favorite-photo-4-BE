import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const gradeSchema = z.enum([
  "COMMON",
  "RARE",
  "SUPER_RARE",
  "LEGENDARY",
]);

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
    totalQuantity: positiveInt.max(10, {
      error: "총 발행량은 최대 10장까지 입력할 수 있습니다.",
    }),
  })
  .strict();
