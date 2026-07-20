import { z } from "zod";

export const markNotificationAsReadParamsSchema = z.object({
  notificationId: z.coerce
    .number({ error: "알림 ID는 숫자여야 합니다." })
    .int({ error: "알림 ID는 정수여야 합니다." })
    .positive({ error: "알림 ID는 양의 정수여야 합니다." }),
});
