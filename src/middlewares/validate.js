// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

const replaceRequestObject = (target, source) => {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, source);
};

export const validateRequest =
  ({ params, query }) =>
  (req, res, next) => {
    try {
      if (params) replaceRequestObject(req.params, params.parse(req.params));
      if (query) replaceRequestObject(req.query, query.parse(req.query));

      next();
    } catch (error) {
      next(error);
    }
  };
