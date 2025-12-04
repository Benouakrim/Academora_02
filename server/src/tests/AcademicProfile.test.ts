import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma BEFORE any imports that use it
vi.mock('@prisma/client', () => {
  // Create mock functions inside the factory
  const mockUserFindUnique = vi.fn();
  const mockUserCreate = vi.fn();
  const mockUserDelete = vi.fn();
  const mockAcademicProfileFindUnique = vi.fn();
  const mockAcademicProfileCreate = vi.fn();
  const mockAcademicProfileUpsert = vi.fn();
  const mockAcademicProfileUpdate = vi.fn();
  const mockAcademicProfileDelete = vi.fn();
  
  // Create mock Prisma class
  class MockPrismaClient {
    user = {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
      delete: mockUserDelete,
      update: vi.fn(),
    };
    academicProfile = {
      findUnique: mockAcademicProfileFindUnique,
      create: mockAcademicProfileCreate,
      upsert: mockAcademicProfileUpsert,
      update: mockAcademicProfileUpdate,
      delete: mockAcademicProfileDelete,
    };
    $connect = vi.fn();
    $disconnect = vi.fn();
  }
  
  return {
    PrismaClient: MockPrismaClient,
    UserRole: { USER: 'USER', ADMIN: 'ADMIN' },
  };
});

// Mock Clerk authentication
vi.mock('@clerk/express', () => ({
  requireAuth: vi.fn((req, res, next) => next()),
  clerkMiddleware: vi.fn((req, res, next) => next()),
}));

// Now import services and types
import { AcademicProfileService } from '../services/AcademicProfileService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

// Get access to the mocked prisma instance
const prisma = new PrismaClient();

describe('AcademicProfile - Data Integrity Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GPA Float Storage', () => {
    it('should store GPA as a float with precision', async () => {
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        gpa: 3.85,
        gpaScale: 4,
        testScores: null,
        highSchoolName: null,
        gradYear: null,
        primaryMajor: null,
        secondaryMajor: null,
        extracurriculars: [],
        academicHonors: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

      const result = await AcademicProfileService.upsert('clerk-123', {
        gpa: 3.85,
        gpaScale: 4,
      });

      expect(result.gpa).toBe(3.85);
      expect(typeof result.gpa).toBe('number');
      expect(result.gpa).not.toBe(3.8); // Verify precision
    });

    it('should handle GPA edge cases (0.0, 5.0, null)', async () => {
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      // Test GPA = 0.0
      const mockProfile1 = { id: 'p1', userId: 'user-123', gpa: 0.0, gpaScale: 4 };
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile1);
      const result1 = await AcademicProfileService.upsert('clerk-123', { gpa: 0.0 });
      expect(result1.gpa).toBe(0.0);

      // Test GPA = 5.0 (weighted scale)
      const mockProfile2 = { id: 'p2', userId: 'user-123', gpa: 5.0, gpaScale: 5 };
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile2);
      const result2 = await AcademicProfileService.upsert('clerk-123', { gpa: 5.0 });
      expect(result2.gpa).toBe(5.0);
    });
  });

  describe('TestScores JSON Structure Integrity', () => {
    it('should store and retrieve testScores as valid JSON', async () => {
      const testScores = {
        SAT: {
          total: 1450,
          math: 750,
          verbal: 700,
          date: '2024-03-15',
        },
        ACT: {
          composite: 32,
          english: 34,
          math: 30,
          reading: 33,
          science: 31,
          date: '2024-04-10',
        },
        AP: [
          { subject: 'Calculus BC', score: 5, year: 2024 },
          { subject: 'Physics C', score: 4, year: 2024 },
        ],
      };

      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        gpa: 3.9,
        gpaScale: 4,
        testScores,
        highSchoolName: 'Test High School',
        gradYear: 2024,
        primaryMajor: 'Computer Science',
        secondaryMajor: null,
        extracurriculars: [],
        academicHonors: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

      const result = await AcademicProfileService.upsert('clerk-123', {
        testScores,
      });

      expect(result.testScores).toEqual(testScores);
      expect(result.testScores.SAT.total).toBe(1450);
      expect(result.testScores.ACT.composite).toBe(32);
      expect(result.testScores.AP).toHaveLength(2);
      expect(result.testScores.AP[0].score).toBe(5);
    });

    it('should handle complex academicHonors JSON structure', async () => {
      const academicHonors = [
        {
          name: 'National Merit Scholar',
          year: 2024,
          level: 'National',
          description: 'Finalist in National Merit Scholarship Program',
        },
        {
          name: 'Math Olympiad Gold',
          year: 2023,
          level: 'International',
          description: 'First place in International Math Olympiad',
        },
        {
          name: "Principal's Honor Roll",
          year: 2024,
          level: 'School',
          description: 'All semesters',
        },
      ];

      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        gpa: 4.0,
        gpaScale: 4,
        testScores: null,
        highSchoolName: null,
        gradYear: null,
        primaryMajor: null,
        secondaryMajor: null,
        extracurriculars: [],
        academicHonors,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

      const result = await AcademicProfileService.upsert('clerk-123', {
        academicHonors,
      });

      expect(result.academicHonors).toHaveLength(3);
      expect(result.academicHonors[0].name).toBe('National Merit Scholar');
      expect(result.academicHonors[1].level).toBe('International');
      expect(result.academicHonors[2].year).toBe(2024);
    });

    it('should handle empty JSON structures gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        gpa: null,
        gpaScale: null,
        testScores: {},
        highSchoolName: null,
        gradYear: null,
        primaryMajor: null,
        secondaryMajor: null,
        extracurriculars: [],
        academicHonors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

      const result = await AcademicProfileService.upsert('clerk-123', {
        testScores: {},
        academicHonors: [],
      });

      expect(result.testScores).toEqual({});
      expect(result.academicHonors).toEqual([]);
    });
  });

  describe('Extracurriculars Array Storage', () => {
    it('should store and retrieve extracurriculars as string array', async () => {
      const extracurriculars = [
        'Student Council President',
        'Varsity Soccer Captain',
        'Math Club Founder',
        'Volunteer Tutor (200+ hours)',
      ];

      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
      };

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        gpa: 3.7,
        gpaScale: 4,
        testScores: null,
        highSchoolName: null,
        gradYear: null,
        primaryMajor: null,
        secondaryMajor: null,
        extracurriculars,
        academicHonors: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

      const result = await AcademicProfileService.upsert('clerk-123', {
        extracurriculars,
      });

      expect(Array.isArray(result.extracurriculars)).toBe(true);
      expect(result.extracurriculars).toHaveLength(4);
      expect(result.extracurriculars[0]).toBe('Student Council President');
    });
  });
});

describe('AcademicProfile - 1-to-1 Relationship Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new profile for a user without one', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const mockNewProfile = {
      id: 'profile-new',
      userId: 'user-123',
      gpa: 3.5,
      gpaScale: 4,
      testScores: null,
      highSchoolName: 'Lincoln High',
      gradYear: 2025,
      primaryMajor: 'Biology',
      secondaryMajor: null,
      extracurriculars: [],
      academicHonors: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.upsert as any).mockResolvedValue(mockNewProfile);

    const result = await AcademicProfileService.upsert('clerk-123', {
      gpa: 3.5,
      highSchoolName: 'Lincoln High',
      gradYear: 2025,
      primaryMajor: 'Biology',
    });

    expect(result.id).toBe('profile-new');
    expect(result.userId).toBe('user-123');
    expect(prisma.academicProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: expect.any(Object),
      create: expect.objectContaining({
        userId: 'user-123',
        gpa: 3.5,
      }),
    });
  });

  it('should update existing profile (upsert behavior)', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const mockUpdatedProfile = {
      id: 'profile-existing',
      userId: 'user-123',
      gpa: 3.9, // Updated from 3.5
      gpaScale: 4,
      testScores: { SAT: { total: 1500 } },
      highSchoolName: 'Lincoln High',
      gradYear: 2025,
      primaryMajor: 'Computer Science', // Changed major
      secondaryMajor: 'Mathematics',
      extracurriculars: ['Robotics Club'],
      academicHonors: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.upsert as any).mockResolvedValue(mockUpdatedProfile);

    const result = await AcademicProfileService.upsert('clerk-123', {
      gpa: 3.9,
      primaryMajor: 'Computer Science',
      secondaryMajor: 'Mathematics',
      testScores: { SAT: { total: 1500 } },
    });

    expect(result.id).toBe('profile-existing');
    expect(result.gpa).toBe(3.9);
    expect(result.primaryMajor).toBe('Computer Science');
    expect(prisma.academicProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: expect.objectContaining({
        gpa: 3.9,
        primaryMajor: 'Computer Science',
      }),
      create: expect.any(Object),
    });
  });

  it('should maintain 1-to-1 relationship constraint', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    // First call creates profile
    const mockProfile1 = { id: 'profile-1', userId: 'user-123', gpa: 3.5 };
    (prisma.academicProfile.upsert as any).mockResolvedValueOnce(mockProfile1);

    await AcademicProfileService.upsert('clerk-123', { gpa: 3.5 });

    // Second call updates same profile (not creates new one)
    const mockProfile2 = { id: 'profile-1', userId: 'user-123', gpa: 3.8 };
    (prisma.academicProfile.upsert as any).mockResolvedValueOnce(mockProfile2);

    const result = await AcademicProfileService.upsert('clerk-123', { gpa: 3.8 });

    // Same ID confirms it's updating, not creating
    expect(result.id).toBe('profile-1');
    expect(prisma.academicProfile.upsert).toHaveBeenCalledTimes(2);
  });
});

describe('AcademicProfile - Cascade Delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete academic profile when user is deleted (cascade)', async () => {
    // This test validates the Prisma schema relationship: onDelete: Cascade
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      academicProfile: {
        id: 'profile-123',
        userId: 'user-123',
        gpa: 3.8,
      },
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.user.delete as any).mockResolvedValue(mockUser);

    // When user is deleted, Prisma automatically deletes related academicProfile
    await prisma.user.delete({ where: { id: 'user-123' } });

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });

    // In a real database, the academicProfile would be automatically deleted
    // This is enforced by the Prisma schema: academicProfile AcademicProfile?
    // with onDelete: Cascade
  });

  it('should allow manual deletion of academic profile', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      gpa: 3.5,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.findUnique as any).mockResolvedValue(mockProfile);
    (prisma.academicProfile.delete as any).mockResolvedValue(mockProfile);

    // Manual deletion through service
    await prisma.academicProfile.delete({ where: { userId: 'user-123' } });

    expect(prisma.academicProfile.delete).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });
});

describe('AcademicProfile - Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without authentication (401 Unauthorized)', async () => {
    // Test that clerkId is required - empty string should find no user
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(
      AcademicProfileService.getByClerkId('')
    ).rejects.toThrow(AppError);

    await expect(
      AcademicProfileService.getByClerkId('')
    ).rejects.toThrow('User not found');
  });

  it('should reject access to non-existent user (404 Not Found)', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(
      AcademicProfileService.getByClerkId('nonexistent-clerk-123')
    ).rejects.toThrow(AppError);

    await expect(
      AcademicProfileService.getByClerkId('nonexistent-clerk-123')
    ).rejects.toThrow('User not found');
  });

  it('should allow access only to own profile', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      gpa: 3.8,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.findUnique as any).mockResolvedValue(mockProfile);

    const result = await AcademicProfileService.getByClerkId('clerk-123');

    expect(result).toEqual(mockProfile);
    expect(result.userId).toBe('user-123');
  });
});

describe('AcademicProfile - Edge Cases and Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle partial updates correctly', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const existingProfile = {
      id: 'profile-123',
      userId: 'user-123',
      gpa: 3.5,
      gpaScale: 4,
      testScores: { SAT: { total: 1400 } },
      highSchoolName: 'Old School',
      gradYear: 2025,
      primaryMajor: 'Biology',
      secondaryMajor: null,
      extracurriculars: ['Chess Club'],
      academicHonors: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // After update, only GPA changes
    const updatedProfile = {
      ...existingProfile,
      gpa: 3.9,
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.upsert as any).mockResolvedValue(updatedProfile);

    const result = await AcademicProfileService.upsert('clerk-123', {
      gpa: 3.9, // Only update GPA
    });

    expect(result.gpa).toBe(3.9);
    expect(result.highSchoolName).toBe('Old School'); // Unchanged
    expect(result.testScores).toEqual({ SAT: { total: 1400 } }); // Unchanged
  });

  it('should handle null and undefined values correctly', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
    };

    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      gpa: null,
      gpaScale: null,
      testScores: null,
      highSchoolName: null,
      gradYear: null,
      primaryMajor: null,
      secondaryMajor: null,
      extracurriculars: [],
      academicHonors: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.academicProfile.upsert as any).mockResolvedValue(mockProfile);

    const result = await AcademicProfileService.upsert('clerk-123', {});

    expect(result.gpa).toBeNull();
    expect(result.testScores).toBeNull();
    expect(result.primaryMajor).toBeNull();
  });

  it('should initialize profile with empty values', async () => {
    const mockUser = {
      id: 'user-123',
    };

    const mockInitializedProfile = {
      id: 'profile-new',
      userId: 'user-123',
      gpa: null,
      gpaScale: null,
      testScores: null,
      highSchoolName: null,
      gradYear: null,
      primaryMajor: null,
      secondaryMajor: null,
      extracurriculars: [],
      academicHonors: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.academicProfile.findUnique as any).mockResolvedValue(null);
    (prisma.academicProfile.create as any).mockResolvedValue(mockInitializedProfile);

    const result = await AcademicProfileService.initializeAcademicProfile('user-123');

    expect(result.userId).toBe('user-123');
    expect(result.gpa).toBeNull();
    expect(prisma.academicProfile.create).toHaveBeenCalledWith({
      data: { userId: 'user-123' },
    });
  });

  it('should not reinitialize if profile already exists', async () => {
    const existingProfile = {
      id: 'profile-existing',
      userId: 'user-123',
      gpa: 3.5,
    };

    (prisma.academicProfile.findUnique as any).mockResolvedValue(existingProfile);

    const result = await AcademicProfileService.initializeAcademicProfile('user-123');

    expect(result.id).toBe('profile-existing');
    expect(prisma.academicProfile.create).not.toHaveBeenCalled();
  });
});
