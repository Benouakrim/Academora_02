// server/src/validation/microContentSchemas.ts

import { z } from 'zod';
import { AppError } from '../utils/AppError';
// NOTE: Assuming shared types are accessible via this path
import { BlockType } from '@/../../shared/types/microContentBlocks'; 

// Helper for validating ISO Date strings used in JSONB (e.g., deadlines)
const ISODateString = z.string().refine(val => !isNaN(new Date(val).getTime()), {
  message: "Must be a valid ISO date string.",
});

// ==========================================================
// --- 1. HARD BLOCK Schemas (Canonical Writers - P4, P5, P13, P21) ---
// ==========================================================

export const AdmissionsRangeMeterSchema = z.object({
  metric: z.enum(['gpa', 'sat', 'act', 'acceptance']).default('gpa'),
  description: z.string().optional(),
  
  // Raw Inputs
  totalApplications: z.number().int().min(0).optional(),
  totalAccepted: z.number().int().min(0).optional(),
  
  // Scalar Data Inputs (ensuring correct type and range)
  minGpa: z.number().min(0).max(5.0).optional(),
  avgGpa: z.number().min(0).max(5.0).optional(),
  
  satMath25: z.number().int().min(200).max(800).optional(),
  satMath75: z.number().int().min(200).max(800).optional(),
  satVerbal25: z.number().int().min(200).max(800).optional(),
  satVerbal75: z.number().int().min(200).max(800).optional(),
  
  actComposite25: z.number().int().min(1).max(36).optional(),
  actComposite75: z.number().int().min(1).max(36).optional(),
}).strict('Admissions data contains unauthorized fields.');

export const CostBreakdownChartSchema = z.object({
  description: z.string().optional(),
  
  inStateTuition: z.number().int().min(0).optional(),
  outStateTuitionPremium: z.number().int().min(0).optional(),
  feesAndInsurance: z.number().int().min(0).optional(),
  
  onCampusHousing: z.number().int().min(0).optional(),
  mealPlanCost: z.number().int().min(0).optional(),
  
  booksAndSuppliesEstimate: z.number().int().min(0).optional(),
  miscPersonalEstimate: z.number().int().min(0).optional(),
  
  currency: z.string().length(3).default('USD'),
}).strict('Cost Breakdown data contains unauthorized fields.');

export const GeographicPhysicalSchema = z.object({
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().min(2).default('USA'),
  
  campusSizeAcres: z.number().int().min(1).optional(),
  nearestAirportCode: z.string().optional(),
  
  showMap: z.boolean().default(true),
  mapZoomLevel: z.number().int().min(1).max(20).optional(),
}).strict('Geographic data contains unauthorized fields.');

export const OutcomeMetricsSchema = z.object({
  graduationRate: z.number().min(0.0).max(1.0, 'Rate must be between 0 and 1.0 (0-100%).'),
  retentionRate: z.number().min(0.0).max(1.0, 'Rate must be between 0 and 1.0 (0-100%).'),
  employmentRate: z.number().min(0.0).max(1.0, 'Rate must be between 0 and 1.0 (0-100%).'),
  averageStartingSalary: z.number().int().min(10000),
  
  postGraduationReportUrl: z.string().url().optional(),
  topEmployers: z.array(z.string().min(1)).optional(),
  
  chartType: z.enum(['bar', 'gauge']).default('gauge'),
}).strict('Outcome Metrics data contains unauthorized fields.');


// ==========================================================
// --- 2. SOFT BLOCK Schemas (JSONB Writers - New Additions) ---
// ==========================================================

// ID 1. Deadline Card
export const DeadlineCardSchema = z.object({
  label: z.string().min(1),
  deadline: ISODateString, 
  description: z.string().optional(),
  showCountdown: z.boolean().default(true),
  icon: z.string().optional(),
}).strict();

// ID 2. Announcement Banner
export const AnnouncementBannerSchema = z.object({
  message: z.string().min(5),
  severity: z.enum(['info', 'warning', 'success', 'error']),
  dismissible: z.boolean().default(true),
  expiresAt: ISODateString.optional(),
  actionText: z.string().optional(),
  actionUrl: z.string().url().optional(),
}).strict();

// ID 8. Testimonial/Quote
export const TestimonialQuoteSchema = z.object({
  quote: z.string().min(10),
  author: z.string().min(2),
  authorTitle: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  rating: z.number().min(1).max(5).optional(),
}).strict();

// ID 11. FAQ Accordion
export const FAQAccordionSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  defaultOpen: z.boolean().default(false),
}).strict();

// ID 14. Link List/Resources
export const LinkListResourcesSchema = z.object({
  description: z.string().optional(),
  links: z.array(z.object({
    id: z.string(),
    title: z.string().min(1),
    url: z.string().url(),
    description: z.string().optional(),
    icon: z.string().optional(),
  })).min(1, 'Link list must contain at least one link.'),
}).strict();

// ID 15. Quick Poll/Survey
export const QuickPollSurveySchema = z.object({
  question: z.string().min(5),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1),
    votes: z.number().int().min(0).optional(), // Votes are optional in input payload
  })).min(2, 'A poll must have at least two options.'),
  allowMultiple: z.boolean().default(false),
  showResults: z.boolean().default(true),
}).strict();

// ID 6. Call to Action (CTA)
export const CallToActionSchema = z.object({
  buttonText: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  style: z.enum(['primary', 'secondary', 'ghost', 'outline']).default('primary'),
  openInNewTab: z.boolean().default(false),
  icon: z.string().optional(),
}).strict();


// ==========================================================
// --- 3. Master Map & Validation Function ---
// ==========================================================

export const MICRO_CONTENT_DATA_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  // Canonical Writers (Hard Blocks)
  'admissions_range_meter': AdmissionsRangeMeterSchema,
  'cost_breakdown_chart': CostBreakdownChartSchema,
  'geographic_physical': GeographicPhysicalSchema,
  'outcome_metrics': OutcomeMetricsSchema,
  
  // JSONB Writers (Soft Blocks)
  'deadline_card': DeadlineCardSchema,
  'announcement_banner': AnnouncementBannerSchema,
  'testimonial_quote': TestimonialQuoteSchema,
  'faq_accordion': FAQAccordionSchema,
  'link_list_resources': LinkListResourcesSchema,
  'quick_poll_survey': QuickPollSurveySchema,
  'call_to_action': CallToActionSchema,
  
  // Add other schemas here as they are defined:
  // 'checklist': ChecklistSchema,
  // 'timeline_roadmap': TimelineRoadmapSchema,
};

// Base Payload (same as defined in P19)
export const MicroContentBasePayloadSchema = z.object({
  blockType: z.custom<BlockType>(),
  universityId: z.string().uuid(),
  title: z.string().min(1).max(255),
  priority: z.number().int().default(0),
  id: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  data: z.record(z.any()), 
}).strict();


/**
 * Validates the full block payload using Zod.
 * @param payload The raw object sent from the client.
 * @returns The fully validated and type-safe payload.
 * @throws AppError on validation failure.
 */
export function validateBlockPayload(payload: Record<string, any>) {
  // 1. Validate Base Payload structure
  const baseValidation = MicroContentBasePayloadSchema.safeParse(payload);
  if (!baseValidation.success) {
    throw new AppError(400, `Invalid block payload format: ${baseValidation.error.message}`);
  }

  const { blockType, data } = baseValidation.data;

  // 2. Validate Data field based on blockType
  const dataSchema = MICRO_CONTENT_DATA_SCHEMAS[blockType];

  if (!dataSchema) {
    // For blocks without a defined schema (non-critical soft blocks), allow generic JSONB
    return baseValidation.data;
  }

  const dataValidation = dataSchema.safeParse(data);
  if (!dataValidation.success) {
    // Format error message for clarity
    const errorDetails = dataValidation.error.errors.map(e => {
        const path = e.path.join('.');
        return `${path}: ${e.message}`;
    }).join('; ');
    
    throw new AppError(400, `Invalid data for block type "${blockType}": ${errorDetails}`);
  }

  // Return the validated base fields and the validated data object
  return {
    ...baseValidation.data,
    data: dataValidation.data, 
  };
}
