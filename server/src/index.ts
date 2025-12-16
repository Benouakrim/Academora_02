import 'dotenv/config'; // Load env vars before other imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { cleanEnv, port, str } from 'envalid';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { Cache } from './lib/cache';

// Validate environment variables
const env = cleanEnv(process.env, {
  PORT: port({ default: 3001 }),
  DATABASE_URL: str({ desc: 'Database connection string' }),
  CLERK_PUBLISHABLE_KEY: str({ desc: 'Clerk publishable key', default: '' }),
  CLERK_SECRET_KEY: str({ desc: 'Clerk secret key', default: '' }),
  CLERK_WEBHOOK_SECRET: str({ desc: 'Clerk webhook signing secret', default: '' }),
  RESEND_API_KEY: str({ desc: 'Resend API Key for emails', default: '' }),
});

const app = express();

// Middleware
app.use(helmet());
app.use(cookieParser());

// Enhanced CORS configuration with detailed logging
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      console.log('[CORS] Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] ✅ Allowing origin:', origin);
      callback(null, true);
    } else {
      console.warn('[CORS] ⚠️ Origin not in allowlist:', origin);
      // Still allow in development for flexibility
      if (process.env.NODE_ENV === 'development') {
        console.log('[CORS] Allowing anyway (development mode)');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// --- CRITICAL: RAW BODY PARSING FOR STRIPE WEBHOOKS ---
// This middleware must run BEFORE express.json() to capture the raw body
app.use((req: any, _res, next) => {
    // Only apply the raw body buffer to the Stripe webhook route
    if (req.originalUrl === '/api/billing/webhook') {
        express.raw({ type: 'application/json' })(req, _res, (err) => {
            if (err) return next(err);
            // Attach the raw body buffer to the request object for Stripe verification
            req.rawBody = req.body;
            next();
        });
    } else {
        next();
    }
});
// -----------------------------------------------------

// Capture raw body for Clerk webhook signature verification (via Svix)
// This must be BEFORE any routes are mounted to capture the body
app.use('/api/webhooks', express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  },
}));

// Standard JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Academora API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      universities: '/api/universities',
      user: '/api/user',
      matching: '/api/matching',
      financialAid: '/api/financial-aid',
      reviews: '/api/reviews',
      articles: '/api/articles',
      admin: '/api/admin'
    }
  });
});

// Mount API routes
// Note: Clerk auth is applied inside individual route files where needed
// Webhooks bypass Clerk auth and use signature verification instead
app.use('/api', router);

// Global error handler (must be after all routes)
app.use(errorHandler);

// Initialize cache before starting server
async function startServer() {
  try {
    // Log Clerk configuration status
    console.log('[Clerk] Configuration check:', {
      hasPublishableKey: !!env.CLERK_PUBLISHABLE_KEY,
      publishableKeyPrefix: env.CLERK_PUBLISHABLE_KEY?.substring(0, 15),
      hasSecretKey: !!env.CLERK_SECRET_KEY,
      secretKeyPrefix: env.CLERK_SECRET_KEY?.substring(0, 15),
      hasWebhookSecret: !!env.CLERK_WEBHOOK_SECRET
    });
    
    // Initialize cache adapter
    await Cache.connect();
    
    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Clerk] Webhook secret configured: ${process.env.CLERK_WEBHOOK_SECRET ? 'yes' : 'no'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();
