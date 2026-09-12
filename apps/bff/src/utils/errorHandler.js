export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error(err);
  } else {
    console.log(err.message);
  }

  return res.status(statusCode).json({
    error: err.message ? err.message : "Internal server error.",
  });
}
