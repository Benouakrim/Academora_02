import { z } from 'zod';

/**
 * Schema for test scores JSON structure
 * Supports SAT, ACT, AP, IB, and other standardized tests
 */
const testScoresSchema = z.object({
  SAT: z.object({
    total: z.number().int().min(400).max(1600).optional(),
    math: z.number().int().min(200).max(800).optional(),
    verbal: z.number().int().min(200).max(800).optional(),
    evidenceBasedReadingWriting: z.number().int().min(200).max(800).optional(),
    date: z.string().optional(), // ISO date or "YYYY-MM" format
  }).optional(),
  
  ACT: z.object({
    composite: z.number().int().min(1).max(36).optional(),
    english: z.number().int().min(1).max(36).optional(),
    math: z.number().int().min(1).max(36).optional(),
    reading: z.number().int().min(1).max(36).optional(),
    science: z.number().int().min(1).max(36).optional(),
    writing: z.number().int().min(2).max(12).optional(),
    date: z.string().optional(),
  }).optional(),
  
  AP: z.array(z.object({
    subject: z.string().min(1),
    score: z.number().int().min(1).max(5),
    year: z.number().int().min(2000).max(2100),
  })).optional(),
  
  IB: z.object({
    predicted: z.number().int().min(0).max(45).optional(),
    final: z.number().int().min(0).max(45).optional(),
    subjects: z.array(z.object({
      name: z.string().min(1),
      level: z.enum(['HL', 'SL']),
      score: z.number().int().min(1).max(7).optional(),
    })).optional(),
  }).optional(),
  
  TOEFL: z.object({
    total: z.number().int().min(0).max(120).optional(),
    reading: z.number().int().min(0).max(30).optional(),
    listening: z.number().int().min(0).max(30).optional(),
    speaking: z.number().int().min(0).max(30).optional(),
    writing: z.number().int().min(0).max(30).optional(),
    date: z.string().optional(),
  }).optional(),
  
  IELTS: z.object({
    overall: z.number().min(0).max(9).optional(),
    listening: z.number().min(0).max(9).optional(),
    reading: z.number().min(0).max(9).optional(),
    writing: z.number().min(0).max(9).optional(),
    speaking: z.number().min(0).max(9).optional(),
    date: z.string().optional(),
  }).optional(),
}).partial().optional();

/**
 * Schema for academic honors JSON structure
 */
const academicHonorsSchema = z.array(z.object({
  name: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  level: z.enum(['School', 'District', 'Regional', 'State', 'National', 'International']).optional(),
  description: z.string().optional(),
})).optional();

/**
 * Schema for updating/creating an Academic Profile
 */
export const updateAcademicProfileSchema = {
  body: z.object({
    // Core Academic Metrics
    gpa: z.number().min(0).max(100).optional(), // Flexible to support different scales
    gpaScale: z.number().int().positive().optional(), // e.g., 4, 5, 10, 100
    
    // Test Scores (validated nested structure)
    testScores: testScoresSchema,
    
    // High School Information
    highSchoolName: z.string().min(1).max(255).optional(),
    gradYear: z.number().int().min(1900).max(2100).optional(),
    
    // Intended Majors
    primaryMajor: z.string().min(1).max(255).optional(),
    secondaryMajor: z.string().min(1).max(255).optional(),
    
    // Extracurricular Activities
    extracurriculars: z.array(
      z.string().min(1).max(500)
    ).max(20).optional(), // Max 20 activities with descriptions up to 500 chars each
    
    // Academic Honors & Awards (validated nested structure)
    academicHonors: academicHonorsSchema,
  }).strict(), // Prevent unknown fields
};

/**
 * Export individual schemas for reuse
 */
export const schemas = {
  testScores: testScoresSchema,
  academicHonors: academicHonorsSchema,
};
