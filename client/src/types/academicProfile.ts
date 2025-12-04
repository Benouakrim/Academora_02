/**
 * TypeScript interfaces for Academic Profile
 * Mirrors the backend Prisma schema for type safety
 */

// Test Scores structure (JSON field)
export interface TestScores {
  SAT?: {
    total?: number
    math?: number
    verbal?: number
    evidenceBasedReadingWriting?: number
    date?: string
  }
  ACT?: {
    composite?: number
    english?: number
    math?: number
    reading?: number
    science?: number
    writing?: number
    date?: string
  }
  AP?: {
    subject: string
    score: number
    year: number
  }[]
  IB?: {
    predicted?: number
    final?: number
    subjects?: {
      name: string
      level: 'HL' | 'SL'
      score?: number
    }[]
  }
  TOEFL?: {
    total?: number
    reading?: number
    listening?: number
    speaking?: number
    writing?: number
    date?: string
  }
  IELTS?: {
    overall?: number
    listening?: number
    reading?: number
    writing?: number
    speaking?: number
    date?: string
  }
}

// Academic Honors structure (JSON field)
export interface AcademicHonor {
  name: string
  year: number
  level?: 'School' | 'District' | 'Regional' | 'State' | 'National' | 'International'
  description?: string
}

// Main Academic Profile interface
export interface AcademicProfile {
  id: string
  userId: string
  
  // Core Academic Metrics
  gpa?: number | null
  gpaScale?: number | null
  
  // Test Scores (flexible JSON structure)
  testScores?: TestScores | null
  
  // High School Information
  highSchoolName?: string | null
  gradYear?: number | null
  
  // Intended Majors
  primaryMajor?: string | null
  secondaryMajor?: string | null
  
  // Extracurricular Activities
  extracurriculars: string[]
  
  // Academic Honors & Awards
  academicHonors?: AcademicHonor[] | null
  
  // Metadata
  createdAt: string
  updatedAt: string
  
  // Computed field (from backend)
  completeness?: number
}

// API Response types
export interface AcademicProfileResponse {
  success: boolean
  data: AcademicProfile | null
  message?: string
}

export interface CompletenessResponse {
  success: boolean
  data: {
    completeness: number
    hasProfile: boolean
  }
}

// Form data types (for creating/updating)
export type AcademicProfileFormData = Omit<
  AcademicProfile,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completeness'
>

export type AcademicProfileUpdateData = Partial<AcademicProfileFormData>
