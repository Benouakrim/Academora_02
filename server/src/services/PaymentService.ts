import Stripe from 'stripe';
import { PrismaClient, UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { SyncService } from './SyncService'; // For syncing roles back to Clerk


// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover', // Use a stable API version
});

const prisma = new PrismaClient();

export class PaymentService {

  /**
   * Creates a Stripe Checkout Session for a new subscription.
   * @param userId The internal Neon DB user ID.
   * @param userEmail The user's primary email (used by Stripe).
   * @returns The Stripe Session URL for redirection.
   */
  static async createCheckoutSession(userId: string, userEmail: string): Promise<{ url: string }> {
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    const clientUrl = process.env.CLIENT_URL_BASE;

    if (!priceId || !clientUrl) {
      throw new AppError(500, 'Stripe or Client URL configuration missing.');
    }

    try {
      const session = await stripe.checkout.sessions.create({
        // The ID of the recurring plan
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        
        // Pre-fill user data
        customer_email: userEmail,
        
        // Critical: Store internal Neon ID for webhook lookups later
        metadata: {
          neonUserId: userId,
        },

        // URLs for redirection after success/failure
        success_url: `${clientUrl}/dashboard/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/pricing?payment=cancelled`,
        
        // Payment methods: Enable standard cards
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new AppError(500, 'Stripe failed to create a valid session URL.');
      }

      return { url: session.url };

    } catch (error) {
      console.error('[Stripe Error]', error);
      throw new AppError(500, 'Failed to connect to Stripe or create checkout session.');
    }
  }

  /**
   * Helper function to update the user's role and ensure Clerk syncs.
   */
  static async updateUserRole(neonUserId: string, newRole: UserRole) {
    const user = await prisma.user.update({
        where: { id: neonUserId },
        data: { role: newRole },
    });
    
    // Ensure the new role is synced back to Clerk for instant client-side access control
    await SyncService.syncNeonToClerk(neonUserId);
    
    return user;
  }
  
  /**
   * Core logic for processing Stripe webhook events.
   * @param rawBody The raw request body string.
   * @param signature The Stripe-Signature header value.
   * @returns A status message.
   */
  static async handleWebhookEvent(rawBody: Buffer, signature: string): Promise<string> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError(500, 'STRIPE_WEBHOOK_SECRET not configured.');
    }

    let event: Stripe.Event;

    try {
      // 1. Verify and Construct the Event
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`[Stripe Webhook] Signature verification failed.`, (err as Error).message);
      throw new AppError(400, 'Webhook Signature Verification Failed');
    }

    const data = event.data.object as any;

    // 2. Handle Core Events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = data as Stripe.Checkout.Session;
        const neonUserId = session.metadata?.neonUserId;
        
        if (neonUserId) {
          // If the payment succeeded, grant PREMIUM access
          await this.updateUserRole(neonUserId, UserRole.PREMIUM);
          console.log(`[Stripe Webhook] PREMIUM access granted to user ${neonUserId}.`);
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        // If the subscription is deleted or moved to a cancelled status, revoke access
        if (data.status === 'canceled' || data.status === 'unpaid' || event.type === 'customer.subscription.deleted') {
            const subscription = data as Stripe.Subscription;
            // Lookup user by Stripe Customer ID (best practice)
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            const neonUserId = (customer as any).metadata?.neonUserId;

            if (neonUserId) {
                // Revert access to the standard USER role
                await this.updateUserRole(neonUserId, UserRole.USER);
                console.log(`[Stripe Webhook] PREMIUM access revoked for user ${neonUserId}.`);
            }
        }
        break;
      }
      // Add other events as needed (e.g., 'invoice.payment_failed')
      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return `Event handled: ${event.type}`;
  }
}
