import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { clerkAuth } from './middleware/requireAuth';

// Load environment variables
dotenv.config();

// Validate environment variables
const env = cleanEnv(process.env, {
  PORT: port({ default: 3001 }),
  DATABASE_URL: str({ desc: 'Database connection string' }),
  CLERK_PUBLISHABLE_KEY: str({ desc: 'Clerk publishable key', default: '' }),
  CLERK_SECRET_KEY: str({ desc: 'Clerk secret key', default: '' }),
  CLERK_WEBHOOK_SECRET: str({ desc: 'Clerk webhook signing secret', default: '' }),
});

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// Attach Clerk auth context so request handlers can read (req as any).auth
app.use(clerkAuth);
// Capture raw body for webhook signature verification (Clerk via Svix)
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', router);

// Global error handler (must be after all routes)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Clerk] Webhook secret configured: ${process.env.CLERK_WEBHOOK_SECRET ? 'yes' : 'no'}`);
});
