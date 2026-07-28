// middlewares/notFound.js
export default function notFound(req, res, next) {
  const error = new Error(`${req.path} 경로를 찾을 수 없습니다.`);

  error.status = 404;
  error.code = "ROUTE_NOT_FOUND";

  next(error);
}
