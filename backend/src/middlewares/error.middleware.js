import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error?.statusCode || 500;
  const message = error?.message || 'Internal server error';
  const errors = error?.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.nodeEnv === 'development' ? { stack: error?.stack } : {}),
  });
};
