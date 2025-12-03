import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { AppError } from '../utils/AppError';
import { UserService } from '../services/UserService';

// Extend Request type to include rawBody
interface WebhookRequest extends Request {
  rawBody?: Buffer;
}

/**
 * Initiates the subscription process by creating a Stripe Checkout Session.
 */
export const startSubscriptionCheckout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = (req as any).auth;
    const clerkId = typeof auth === 'function' ? auth()?.userId : undefined;
    
    if (!clerkId) {
      return res.status(401).json({ error: 'unauthenticated' });
    }

    // 1. Get the Neon User Profile to grab ID and Email
    const profile = await UserService.getProfile(clerkId);
    
    if (!profile || !profile.email) {
      throw new AppError(404, 'User profile is incomplete or missing email.');
    }
    
    // 2. Create the Checkout Session
    const sessionData = await PaymentService.createCheckoutSession(profile.id, profile.email);

    // 3. Send the session URL back to the client for redirection
    res.status(200).json({ 
        status: 'success', 
        url: sessionData.url 
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Handles incoming Stripe Webhooks and verifies the signature.
 * NOTE: This route must use the raw body parser middleware in index.ts.
 */
export const handleStripeWebhook = async (req: WebhookRequest, res: Response, next: NextFunction) => {
    try {
        const sig = req.headers['stripe-signature'] as string;
        
        if (!sig) {
            console.warn('[Stripe Webhook] Missing signature header.');
            return res.status(400).end();
        }
        
        // req.rawBody is set by the custom raw body parser middleware
        if (!req.rawBody) {
             console.error('[Stripe Webhook] Raw body missing. Middleware configuration error.');
             return res.status(500).json({ error: 'Server configuration error: Raw body not available.' });
        }

        // The core verification and event handling happens in the service layer
        await PaymentService.handleWebhookEvent(req.rawBody, sig);

        // Success response must be immediate and simple
        res.status(200).json({ received: true });

    } catch (err) {
        // Send Stripe-required 400 response for verification/parsing errors
        if (err instanceof AppError && err.statusCode === 400) {
            return res.status(400).json({ error: (err as Error).message });
        }
        // General server error
        next(err);
    }
};
