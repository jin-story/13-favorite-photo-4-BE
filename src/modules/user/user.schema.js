import { Grade, Genre } from "@prisma/client";
import { z } from "zod";

export const getMyInventoriesQuerySchema = z.object({
  keyword: z
    .string({ error: "검색어는 문자열이어야 합니다." })
    .trim()
    .min(1, { error: "검색어를 한 글자 이상 입력해주세요." })
    .optional(),

  grade: z.enum(Grade, { error: "올바른 등급을 선택해주세요" }).optional(),

  genre: z.enum(Genre, { error: "올바른 장르를 선택해주세요" }).optional(),
});

export const markNotificationAsReadParamsSchema = z.object({
  notificationId: z.coerce
    .number({ error: "알림 ID는 숫자여야 합니다." })
    .int({ error: "알림 ID는 정수여야 합니다." })
    .positive({ error: "알림 ID는 양의 정수여야 합니다." }),
});
