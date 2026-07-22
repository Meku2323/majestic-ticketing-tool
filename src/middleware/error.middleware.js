export function errorHandler(err, req, res, next) {
  console.error('💥 An unhandled error exception occurred within the routing architecture:', err.stack);

  // Fallback structural defaults for generic unknown failures
  let statusCode = 500;
  let message = 'Internal Server Error: A severe system operation fault occurred.';

  // Intercept explicit custom request validation criteria issues
  if (err.name === 'ValidationError' || err.code === 'P2002') {
    statusCode = 400;
    message = 'Data persistence conflict or malformed parameters array received.';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || message,
    ...(process.env.NODE_ENV === 'development' && { trace: err.stack })
  });
}
