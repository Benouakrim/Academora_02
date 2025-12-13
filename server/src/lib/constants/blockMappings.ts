// server/src/lib/constants/blockMappings.ts

// Maps a blockType to the University scalar columns it is authorized to update.
// This enforces the "Canonical Writer" rule (Scenario 1 solution).
export const CANONICAL_FIELD_MAP: Record<string, string[]> = {
  // Hard Blocks - MUST be on the profile, update scalar columns
  // Mapped to the actual Prisma field names
  'admissions_range_meter': ['acceptanceRate', 'avgGpa', 'satMath25', 'satMath75', 'actComposite25', 'actComposite75', 'minGpa'],
  'financial_aid_wizard': ['tuitionOutState', 'tuitionInState', 'averageNetPrice', 'percentReceivingAid'],
  'deadline_card': ['applicationDeadline', 'earlyDecisionDeadline'],
  'institutional_profile': ['websiteUrl', 'logoUrl', 'logoMediaId', 'heroImageUrl', 'heroImageMediaId', 'type', 'classification', 'setting', 'slug', 'name'],
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
  // NEW HARD BLOCK (Prompt 13): Geographic & Physical Data
  'geographic_physical': [
    'address', 'city', 'state', 'zipCode', 'country',
    'latitude', 'longitude', // Calculated from geocoding
    'climateZone', 'nearestAirport', // Lookups based on coordinates
    'campusSizeAcres', 'region' // Direct input + derived
  ],
};

// Blocks that must always be present and cannot be deleted by an admin.
// These are flagged by the isHard: true property in the MicroContent table.
export const HARD_BLOCK_TYPES: string[] = [
  'institutional_profile',
  'geographic_physical', // NEW (Prompt 13): Canonical geographic data block
  'admissions_range_meter',
  'financial_aid_wizard',
  'student_body_profile',
  'outcome_metrics', // ADDED (Prompt 21): Outcome Metrics hard block
  'cost_breakdown_chart',
  'rich_text_block', // Used for mandatory About section
  'deadline_card',
  // NEW ESSENTIAL HARD BLOCKS (P23 - Non-Canonical Writers)
  'contact_box', // Must always be present for communication
  'campus_map_poi', // Must always be present for location/map
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
  // NEW (Prompt 13): Geographic data fields that require approval before live
  'latitude',
  'longitude',
  'climateZone',
  'nearestAirport',
  'address',
  'city',
  'state',
  'zipCode',
  'country',
  // NEW (Prompt 21): Outcome Metrics fields that require approval before live
  'graduationRate',
  'retentionRate',
  'employmentRate',
  'averageStartingSalary',
  // Add other critical fields here if they require admin approval before going live
];
