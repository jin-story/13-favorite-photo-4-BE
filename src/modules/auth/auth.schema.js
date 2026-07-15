import z from "zod";

export const userCreateSchema = z.object({
  email: z.email("유효한 이메일 형식이 아닙니다."),
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(12, "최대 길이는 12자입니다."),
  encryptedPassword: z.string().min(8, "비밀번호는 최소 8자이상입니다."),
});

export const loginSchema = z.object({
  email: z.email("유효한 이메일 형식이 아닙니다."),
  encryptedPassword: z.string(),
});
