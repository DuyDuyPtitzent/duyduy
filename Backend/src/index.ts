import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`INFO: Server đang chạy trên port ${config.port} [${config.nodeEnv}]`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => console.log('💥 Process terminated!'));
});