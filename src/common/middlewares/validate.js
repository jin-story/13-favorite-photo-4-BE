// middlewares/validate.js
const setRequestProperty = (req, key, value) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

export const validateRequest =
  ({ body, params, query }) =>
  (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (params) {
        setRequestProperty(req, "params", params.parse(req.params));
      }
      if (query) {
        setRequestProperty(req, "query", query.parse(req.query));
      }

      next();
    } catch (error) {
      next(error);
    }
  };

// 기존 validate 호출부의 호환성 때문에 유지 모든 라우트 validateRequest로 변경한 뒤 삭제 예정
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
