export function createHttpError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}
