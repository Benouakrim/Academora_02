// client/src/lib/constants/blockMappings.ts
/**
 * Client-side block mapping constants
 * Mirrors server-side mappings for UI enforcement of canonical writer rules
 */

// Maps a blockType to the University scalar columns it is authorized to update.
// This enforces the "Canonical Writer" rule (Scenario 1 solution).
export const CANONICAL_FIELD_MAP: Record<string, string[]> = {
  // Hard Blocks - MUST be on the profile, update scalar columns
  // Mapped to the actual Prisma field names
  'admissions_range_meter': ['acceptanceRate', 'avgGpa', 'satMath25', 'satMath75', 'actComposite25', 'actComposite75', 'minGpa'],
  'financial_aid_wizard': ['tuitionOutState', 'tuitionInState', 'averageNetPrice', 'percentReceivingAid'],
  'deadline_card': ['applicationDeadline', 'earlyDecisionDeadline'],
  'institutional_profile': ['websiteUrl', 'logoUrl', 'type', 'classification', 'setting', 'slug', 'name'],
  'student_body_profile': ['studentPopulation', 'percentMale', 'percentFemale', 'diversityScore', 'studentFacultyRatio'],
  'outcome_metrics': ['graduationRate', 'retentionRate', 'employmentRate', 'averageStartingSalary'],
  'cost_breakdown_chart': [
    'tuitionInState', 
    'tuitionOutState', 
    'roomAndBoard', 
    'booksAndSupplies', 
    'costOfLiving',
    'tuitionInternational'
  ],
};

// Blocks that must always be present and cannot be deleted by an admin.
// These are flagged by the isHard: true property in the MicroContent table.
export const HARD_BLOCK_TYPES: string[] = [
  'institutional_profile',
  'geographic_physical', // Assumed new block from plan
  'admissions_range_meter',
  'financial_aid_wizard',
  'student_body_profile',
  'outcome_metrics',
  'cost_breakdown_chart',
];

// List of scalar fields that have a Draft/Staging column counterpart.
// This supports the approval workflow (Scenario 4 solution).
export const DRAFT_COLUMNS: string[] = [
  'acceptanceRate',
  'applicationDeadline',
  'earlyDecisionDeadline',
  'avgGpa',
  'tuitionOutState',
  'tuitionInState',
  'averageNetPrice',
  'minGpa',
  'satMath25',
  'satMath75',
  'satVerbal25',
  'satVerbal75',
  'actComposite25',
  'actComposite75',
  'avgSatScore',
  'avgActScore',
  'tuitionInternational',
  'roomAndBoard',
  'booksAndSupplies',
  'costOfLiving',
  'studentPopulation',
  // Add other critical fields here if they require admin approval before going live
];
