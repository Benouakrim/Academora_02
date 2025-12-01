import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

// Clerk webhook handler
export const handleClerkWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const svixId = req.headers['svix-id'] as string | undefined;
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
    const svixSignature = req.headers['svix-signature'] as string | undefined;

    if (!svixId || !svixTimestamp || !svixSignature) {
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
        if (existing) {
          const updateData: any = { firstName, lastName, avatarUrl };
          if (email) updateData.email = email;
          await prisma.user.update({ where: { clerkId }, data: updateData });
        } else if (email) {
          await prisma.user.create({ data: { clerkId, email, firstName, lastName, avatarUrl } });
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
        break;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
