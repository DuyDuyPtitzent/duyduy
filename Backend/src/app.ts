import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDB } from './config/database';
import { AppError } from './utils/AppError';

import authRoutes from './routes/auth.routes';

const app: Application = express();

connectDB();

// Middlewares
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.get('/api/healthcheck', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy!' });
});
app.use('/api/auth', authRoutes);

// Handle 404
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl} trên server này!`, 404));
});

// Global Error Handler
app.use(((err: Error, req: Request, res: Response, _next: NextFunction) => { // Cast to express.ErrorRequestHandler
  if (err instanceof AppError) {
    const errorResponse: { status: string; message: string; stack?: string } = {
      status: err.status,
      message: err.message,
    };
    // Include stack trace in development for AppError
    if (config.nodeEnv === 'development' && err.stack) {
      errorResponse.stack = err.stack;
    }
    res.status(err.statusCode).json(errorResponse); // Removed return
    return; // Explicitly return to satisfy void | Promise<void> if needed, or just let it be implicit
  }

  // For unexpected errors
  console.error('LỖI KHÔNG XÁC ĐỊNH 💥:', err); // Log the full error object

  if (config.nodeEnv === 'development') {
    // In development, send detailed error information
    res.status(500).json({ // Removed return
      status: 'error',
      name: err.name, // Include error name
      message: err.message,
      stack: err.stack,
    });
    return; // Explicitly return
  }

  // In production, send a generic message
  res.status(500).json({ // Removed return
    status: 'error',
    message: 'Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau.',
  });
  // No explicit return needed here as it's the end of the function
}) as express.ErrorRequestHandler);

export default app;