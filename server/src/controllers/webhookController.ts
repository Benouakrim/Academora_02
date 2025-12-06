import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { UserRole } from '@prisma/client';
import { clerkClient } from '@clerk/express';
import { AppError } from '../utils/AppError';
import { EmailService } from '../services/EmailService';
import { SyncService } from '../services/SyncService';
import { BadgeService } from '../services/BadgeService';
import prisma from '../lib/prisma';

// Clerk webhook handler
export const handleClerkWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Clerk Webhook] Received webhook request');
    console.log('[Clerk Webhook] Headers:', req.headers);
    
    const svixId = req.headers['svix-id'] as string | undefined;
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
    const svixSignature = req.headers['svix-signature'] as string | undefined;

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Clerk Webhook] Missing svix headers');
      throw new AppError(400, 'Missing svix headers');
    }

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) throw new AppError(500, 'CLERK_WEBHOOK_SECRET not configured');

    const wh = new Webhook(secret);
    const payload = (req as any).rawBody;
    if (!payload) throw new AppError(400, 'Missing raw body');

    let evt: any;
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      throw new AppError(400, 'Invalid webhook signature');
    }

    const eventType = evt.type;

    console.log('[Clerk Webhook] Event type:', eventType);
    console.log('[Clerk Webhook] Event data:', JSON.stringify(evt.data, null, 2));

    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const data = evt.data;
        const clerkId: string = data.id;

        // Try to resolve email more robustly (handles Clerk test payloads)
        let email: string | undefined;
        const emailAddresses: any[] | undefined = data.email_addresses;
        const primaryEmailId: string | undefined = data.primary_email_address_id;
        if (Array.isArray(emailAddresses) && emailAddresses.length > 0) {
          if (primaryEmailId) {
            const primary = emailAddresses.find((e: any) => e.id === primaryEmailId);
            email = primary?.email_address || emailAddresses[0]?.email_address;
          } else {
            email = emailAddresses[0]?.email_address;
          }
        }

        const firstName: string | undefined = data.first_name || undefined;
        const lastName: string | undefined = data.last_name || undefined;
        const avatarUrl: string | undefined = data.image_url || data.profile_image_url || undefined;

        // If email is missing (e.g., Clerk "Send example" payload), do not fail the webhook.
        // Update existing record if present; otherwise, skip creation and acknowledge.
        const existing = await prisma.user.findUnique({ where: { clerkId } });
        console.log('[Clerk Webhook] Existing user found:', !!existing);
        
        if (existing) {
          const updateData: any = { firstName, lastName, avatarUrl };
          if (email) updateData.email = email;
          await prisma.user.update({ where: { clerkId }, data: updateData });
          
          // --- NEW SYNC LOGIC (Update) ---
          await SyncService.syncNeonToClerk(existing.id).catch(e => 
            console.error('Failed to sync role to Clerk during update:', e)
          );
          // -------------------------------
          
          console.log('[Clerk Webhook] User updated:', clerkId);
        } else if (email) {
          console.log('[Clerk Webhook] Creating new user with email:', email);
          const newUser = await prisma.user.create({ data: { clerkId, email, firstName, lastName, avatarUrl } });
          console.log('[Clerk Webhook] User created successfully:', newUser.id);
          
          // --- NEW SYNC LOGIC (Creation) ---
          await SyncService.syncNeonToClerk(newUser.id).catch(e => 
            console.error('Failed to sync role to Clerk during creation:', e)
          );
          // ---------------------------------
          
          // --- NEW LOGIC: Award Badge on Creation (Fire and Forget) ---
          BadgeService.awardBadge(newUser.id, 'early-bird').catch(e =>
            console.error('[Clerk Webhook] Failed to award Early-Bird badge:', e)
          );
          // -----------------------------------------------------------
          
          // Send welcome email (fire and forget to avoid blocking webhook response)
          EmailService.sendWelcomeEmail(email, firstName || 'Student')
            .catch(e => console.error('Webhook email error:', e));
        } else {
          // No email and no existing record — acknowledge without DB write
          console.warn('[Clerk webhook] No email provided; skipped user upsert for', clerkId);
        }
        break;
      }
      case 'user.deleted': {
        const clerkId: string = evt.data.id;
        try {
          await prisma.user.delete({ where: { clerkId } });
        } catch (_) {
          // Ignore if already deleted
        }
        break;
      }
      default:
        // Non-user events ignored gracefully
        console.log('[Clerk Webhook] Ignoring event type:', eventType);
        break;
    }

    console.log('[Clerk Webhook] Processing completed successfully');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Clerk Webhook] Error:', err);
    next(err);
  }
};
