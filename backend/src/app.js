import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

export const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientUrls.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, 'CORS origin denied'));
    },
    credentials: true
  })
);

app.use(helmet());
app.use(compression());
app.use(apiLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wine Quality Analyzer API is healthy'
  });
});

app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

