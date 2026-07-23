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

  cursor: z.coerce
    .number({ error: "커서는 숫자여야 합니다." })
    .int({ error: "커서는 정수여야 합니다." })
    .positive({ error: "커서는 양의 정수여야 합니다." })
    .optional(),

  limit: z.coerce
    .number({ error: "조회 개수는 숫자여야 합니다." })
    .int({ error: "조회 개수는 정수여야 합니다." })
    .positive({ error: "조회 개수는 양의 정수여야 합니다." })
    .default(15),

  includeMeta: z
    .stringbool({
      truthy: ["true"],
      falsy: ["false"],
    })
    .default(false),
});

export const markNotificationAsReadParamsSchema = z.object({
  notificationId: z.coerce
    .number({ error: "알림 ID는 숫자여야 합니다." })
    .int({ error: "알림 ID는 정수여야 합니다." })
    .positive({ error: "알림 ID는 양의 정수여야 합니다." }),
});
