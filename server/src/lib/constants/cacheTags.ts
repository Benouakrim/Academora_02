// server/src/lib/constants/cacheTags.ts

// Maps a live scalar field name to a high-level cache category tag.
// This is used to determine which portion of the merged profile is affected by a change.
export const SCALAR_FIELD_TO_CACHE_TAG: Record<string, string> = {
  // --- Identity & Basic Profile ---
  'slug': 'identity',
  'name': 'identity',
  'logoUrl': 'identity',
  'websiteUrl': 'identity',

  // --- Admissions & Selectivity ---
  'acceptanceRate': 'admissions',
  'applicationDeadline': 'admissions',
  'minGpa': 'admissions',
  'avgGpa': 'admissions',
  'avgSatScore': 'admissions',
  'avgActScore': 'admissions',

  // --- Financials & Cost ---
  'tuitionOutState': 'cost',
  'tuitionInState': 'cost',
  'roomAndBoard': 'cost',
  'averageNetPrice': 'cost',
  'percentReceivingAid': 'cost',

  // --- Geographic & Physical ---
  'latitude': 'location',
  'longitude': 'location',
  'climateZone': 'location',
  'campusSizeAcres': 'location',
  'nearestAirport': 'location',

  // --- Outcomes & Research ---
  'graduationRate': 'outcomes',
  'employmentRate': 'outcomes',
  'averageStartingSalary': 'outcomes',
  'ROIPercentage': 'outcomes',
  'researchOutputScore': 'research',
  'citationIndex': 'research',
};

// Define the top-level cache tags (categories)
export const TOP_LEVEL_CACHE_TAGS = [
  'identity',
  'admissions',
  'cost',
  'location',
  'outcomes',
  'research',
  'microcontent', // Tag for soft blocks
];

// Base key structure for a University profile entry
export const UNIVERSITY_PROFILE_KEY = 'university:profile:';
