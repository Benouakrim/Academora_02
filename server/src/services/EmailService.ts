import nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError';
import fs from 'fs';
import path from 'path';

// Nodemailer Transporter setup (reads from .env)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const SENDER_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'no-reply@academora.com';


export class EmailService {
    
    /**
     * Reads and loads an HTML email template, replacing placeholders.
     * @param templateName The name of the HTML file (e.g., 'matchFound').
     * @param replacements An object of key/value pairs for placeholders.
     * @returns The processed HTML string.
     */
    private static loadTemplate(templateName: string, replacements: Record<string, string>): string {
        const templatePath = path.join(__dirname, '..', 'emails', `${templateName}.html`);
        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace all {{ placeholder }} with corresponding value
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{ ${key} }}`, 'g');
            html = html.replace(regex, value);
        }
        
        // Add dynamic current year and unsubscribe link to all templates
        html = html.replace(/{{ currentYear }}/g, new Date().getFullYear().toString());
        // NOTE: Unsubscribe logic is often complex (requires unique token). For MVP, use a placeholder.
        html = html.replace(/{{ unsubscribeLink }}/g, `${process.env.CLIENT_URL_BASE}/unsubscribe`); 

        return html;
    }


    /**
     * Sends a basic welcome email to a new user. (Called from webhookController)
     */
    static async sendWelcomeEmail(to: string, userName: string) {
        console.log(`[EmailService] Sending welcome email to: ${to}`);
        
        const subject = `Welcome to AcademOra, ${userName}!`;
        const text = `Hello ${userName}, welcome to AcademOra. Start your university journey now: ${process.env.CLIENT_URL_BASE}/dashboard`;

        const mailOptions = {
            from: SENDER_ADDRESS,
            to: to,
            subject: subject,
            text: text,
            // A simple HTML body can also be constructed here if no template is needed
        };

        try {
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('[EmailService ERROR] Failed to send welcome email:', error);
            // It's usually better to log the error than throw, as emails shouldn't crash webhooks
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Sends a rich HTML email when a user's Match Engine discovers a new top-tier match.
     */
    static async sendMatchFoundNotification(to: string, data: { 
        userName: string, 
        uniName: string, 
        uniLocation: string, 
        matchScore: number, 
        netPrice: number 
    }) {
        console.log(`[EmailService] Sending Match Found email to: ${to} for ${data.uniName}`);
        
        const replacements = {
            userName: data.userName,
            uniName: data.uniName,
            uniLocation: data.uniLocation,
            matchScore: data.matchScore.toFixed(0),
            netPrice: `$${data.netPrice.toLocaleString()}`,
            ctaLink: `${process.env.CLIENT_URL_BASE}/dashboard/matching-engine`, 
        };
        
        let htmlBody: string;
        try {
            htmlBody = this.loadTemplate('matchFound', replacements);
        } catch(e) {
            console.error('[EmailService ERROR] Failed to load matchFound template:', e);
            // Fallback to text if HTML fails
            return this.sendWelcomeEmail(to, data.userName); 
        }

        const mailOptions = {
            from: SENDER_ADDRESS,
            to: to,
            subject: `🔥 HOT MATCH ALERT: ${data.uniName} scored highly!`,
            html: htmlBody,
            text: `A new university match was found for you: ${data.uniName} with a score of ${data.matchScore}. View details here: ${replacements.ctaLink}`
        };

        try {
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('[EmailService ERROR] Failed to send match found email:', error);
            return { success: false, error: (error as Error).message };
        }
    }
}
