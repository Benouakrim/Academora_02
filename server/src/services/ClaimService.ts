import { ClaimStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CreateClaimData } from '../validation/claimSchemas';
import prisma from '../lib/prisma';

/**
 * Service for managing University and UniversityGroup claims
 */
export class ClaimService {
  /**
   * Create a new claim request
   * @param userId - ID of the user making the claim
   * @param data - Validated claim data
   * @returns The created claim record
   */
  static async create(userId: string, data: CreateClaimData) {
    // Check for existing pending claim to prevent duplicates
    const existingClaim = await prisma.universityClaim.findFirst({
      where: {
        userId,
        ...(data.universityId && { universityId: data.universityId }),
        ...(data.universityGroupId && { universityGroupId: data.universityGroupId }),
        status: ClaimStatus.PENDING,
      },
    });

    if (existingClaim) {
      throw new AppError(
        409,
        'You already have a pending claim for this entity'
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create the claim record
    const claim = await prisma.universityClaim.create({
      data: {
        userId,
        universityId: data.universityId,
        universityGroupId: data.universityGroupId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        institutionalEmail: data.requesterEmail, // Using requesterEmail as institutionalEmail
        position: data.position,
        department: data.department,
        verificationDocuments: data.verificationDocuments,
        comments: data.comments,
        status: ClaimStatus.PENDING,
        expiresAt,
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return claim;
  }

  /**
   * Get all claims for a specific user
   * @param userId - ID of the user
   * @returns Array of claims with related entities
   */
  static async getUserClaims(userId: string) {
    const claims = await prisma.universityClaim.findMany({
      where: { userId },
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return claims;
  }

  /**
   * Get a single claim by ID
   * @param id - Claim ID
   * @returns The claim or throws 404
   */
  static async getById(id: string) {
    const claim = await prisma.universityClaim.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found');
    }

    return claim;
  }

  /**
   * Review a claim (approve or reject)
   * @param id - Claim ID
   * @param status - New status (APPROVED or REJECTED)
   * @param adminId - ID of the admin reviewing the claim
   * @param adminNotes - Optional notes from admin
   * @returns The updated claim
   */
  static async reviewClaim(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    adminNotes?: string
  ) {
    // Get the claim first
    const claim = await this.getById(id);

    if (claim.status !== ClaimStatus.PENDING) {
      throw new AppError(400, 'This claim has already been reviewed');
    }

    // Check if claim has expired
    if (claim.expiresAt && new Date() > claim.expiresAt) {
      throw new AppError(400, 'This claim has expired');
    }

    // Update the claim
    const updatedClaim = await prisma.universityClaim.update({
      where: { id },
      data: {
        status: status as ClaimStatus,
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminNotes,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If approved, grant ownership
    if (status === 'APPROVED') {
      if (claim.universityId) {
        // Grant university ownership
        await prisma.university.update({
          where: { id: claim.universityId },
          data: {
            claimedById: claim.userId,
            claimedAt: new Date(),
          },
        });

        console.log(`✅ University ownership granted: ${claim.university?.name} → User ${claim.userId}`);
      } else if (claim.universityGroupId) {
        // Grant university group ownership
        await prisma.universityGroup.update({
          where: { id: claim.universityGroupId },
          data: {
            claimedById: claim.userId,
            claimedAt: new Date(),
          },
        });

        console.log(`✅ Group ownership granted: ${claim.universityGroup?.name} → User ${claim.userId}`);
      }

      // TODO: Send notification to user (implement when notification service is ready)
      console.log(`📧 Notification: Claim approved for user ${claim.user.email}`);
    } else {
      // Rejection notification
      console.log(`📧 Notification: Claim rejected for user ${claim.user.email}`);
    }

    return updatedClaim;
  }

  /**
   * Get all pending claims (for admin dashboard)
   * @returns Array of pending claims
   */
  static async getPendingClaims() {
    const claims = await prisma.universityClaim.findMany({
      where: {
        status: ClaimStatus.PENDING,
        expiresAt: {
          gte: new Date(), // Only non-expired claims
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    return claims;
  }

  /**
   * Get all claims (for admin with filtering)
   * @param status - Optional status filter
   * @returns Array of claims
   */
  static async getAllClaims(status?: ClaimStatus) {
    const claims = await prisma.universityClaim.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return claims;
  }
}
