// Central error handler
export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const msg = err.message || "Server error";
  res.status(status).json({ message: msg });
}
