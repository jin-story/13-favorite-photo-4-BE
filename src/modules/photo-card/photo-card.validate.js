export const validateRequest =
  ({ params, query }) =>
  (req, res, next) => {
    try {
      if (params) Object.assign(req.params, params.parse(req.params));
      if (query) Object.assign(req.query, query.parse(req.query));

      next();
    } catch (error) {
      next(error);
    }
  };
