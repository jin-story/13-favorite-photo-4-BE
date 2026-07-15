import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const date = new Date().toISOString();

  const respond = (status, code, message) => {
    return res.status(status).json({
      path: req.path,
      method: req.method,
      status,
      code,
      message,
      date,
    });
  };

  if (error instanceof ZodError) {
    return respond(
      400,
      "INVALID_REQUEST",
      error.issues[0]?.message ?? "입력 데이터가 올바르지 않습니다.",
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return respond(409, "CONFLICT", "이미 존재하는 데이터입니다.");
    }

    if (error.code === "P2025") {
      return respond(404, "NOT_FOUND", "리소스를 찾을 수 없습니다.");
    }

    if (error.code === "P2003") {
      return respond(
        400,
        "FOREIGN_KEY_CONSTRAINT_FAILED",
        "참조하는 리소스가 올바르지 않습니다.",
      );
    }
  }

  const status = error.status ?? 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(error);

    return respond(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }

  return respond(
    status,
    error.code ?? "REQUEST_FAILED",
    error.message ?? "요청 처리 중 오류가 발생했습니다.",
  );
}
