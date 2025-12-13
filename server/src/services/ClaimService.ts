import { ClaimStatus, ClaimType, CommunicationType, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';
import type { 
  CreateClaimInput, 
  UpdateClaimStatusInput, 
  PostMessageInput,
  SubmitClaimDataInput,
  AuditLogEntry 
} from '../../../shared/schemas/claimSchemas';

/**
 * Enhanced Service for managing University Claims with Communication & State Machine
 */
export class ClaimService {
  /**
   * Valid state transitions for the claim status state machine
   */
  private static readonly VALID_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
    PENDING: ['UNDER_REVIEW', 'REJECTED', 'ARCHIVED'],
    APPROVED: ['VERIFIED', 'ARCHIVED'],
    UNDER_REVIEW: ['ACTION_REQUIRED', 'VERIFIED', 'REJECTED', 'ARCHIVED', 'APPROVED'],
    ACTION_REQUIRED: ['UNDER_REVIEW', 'REJECTED', 'ARCHIVED'],
    PENDING_DOCUMENTS: ['UNDER_REVIEW', 'ACTION_REQUIRED', 'REJECTED', 'ARCHIVED'],
    VERIFIED: ['ARCHIVED'],
    REJECTED: ['ARCHIVED'], // Can only archive once rejected
    ARCHIVED: [], // Terminal state
  };

  /**
   * Create audit log entry
   */
  private static createAuditEntry(
    userId: string,
    userName: string,
    action: string,
    fromStatus?: ClaimStatus,
    toStatus?: ClaimStatus,
    note?: string
  ): AuditLogEntry {
    return {
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      fromStatus,
      toStatus,
      note,
    };
  }

  /**
   * Append to audit log
   */
  private static appendAuditLog(
    currentLog: Prisma.JsonValue | null,
    newEntry: AuditLogEntry
  ): AuditLogEntry[] {
    const log = Array.isArray(currentLog) ? (currentLog as AuditLogEntry[]) : [];
    return [...log, newEntry];
  }

  /**
   * Validate state transition
   */
  private static validateStateTransition(from: ClaimStatus, to: ClaimStatus): void {
    const validTransitions = this.VALID_TRANSITIONS[from];
    if (!validTransitions.includes(to)) {
      throw new AppError(
        400,
        `Invalid state transition: Cannot change status from ${from} to ${to}`
      );
    }
  }

  /**
   * Get claim details with full relations
   * @param id - Claim ID
   * @returns Claim with all related data
   */
  static async getClaimDetails(id: string) {
    const claim = await prisma.universityClaim.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            clerkId: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            country: true,
            type: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
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
        ClaimMessage: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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
   * Update claim status with state machine validation
   * @param id - Claim ID
   * @param status - New status
   * @param adminId - ID of admin performing action
   * @param auditNote - Required note for audit log
   * @param adminNotes - Optional internal notes
   */
  static async updateStatus(
    id: string,
    status: ClaimStatus,
    adminId: string,
    auditNote: string,
    adminNotes?: string
  ) {
    // Get current claim
    const claim = await this.getClaimDetails(id);

    // Validate state transition
    this.validateStateTransition(claim.status, status);

    // Get admin info for audit log
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { firstName: true, lastName: true },
    });

    if (!admin) {
      throw new AppError(404, 'Admin user not found');
    }

    const adminName = `${admin.firstName} ${admin.lastName}`;

    // Create audit entry
    const auditEntry = this.createAuditEntry(
      adminId,
      adminName,
      `Status changed from ${claim.status} to ${status}`,
      claim.status,
      status,
      auditNote
    );

    // Update claim with new audit log
    const updatedClaim = await prisma.universityClaim.update({
      where: { id },
      data: {
        status,
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminNotes: adminNotes || claim.adminNotes,
        auditLog: this.appendAuditLog(claim.auditLog, auditEntry) as any,
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
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If verified, grant ownership
    if (status === ClaimStatus.VERIFIED) {
      await this.grantOwnership(claim);
    }

    return updatedClaim;
  }

  /**
   * Grant ownership after verification
   */
  private static async grantOwnership(claim: any) {
    if (claim.universityId) {
      await prisma.university.update({
        where: { id: claim.universityId },
        data: {
          claimedById: claim.userId,
          claimedAt: new Date(),
        },
      });
      console.log(`✅ University ownership granted: ${claim.university?.name} → User ${claim.userId}`);
    } else if (claim.universityGroupId) {
      await prisma.universityGroup.update({
        where: { id: claim.universityGroupId },
        data: {
          claimedById: claim.userId,
          claimedAt: new Date(),
        },
      });
      console.log(`✅ Group ownership granted: ${claim.universityGroup?.name} → User ${claim.userId}`);
    }
  }

  /**
   * Post a message (chat or document request)
   * @param claimId - Claim ID
   * @param senderId - User ID of sender
   * @param payload - Message data
   */
  static async postMessage(
    claimId: string,
    senderId: string,
    payload: PostMessageInput
  ) {
    // Verify claim exists
    const claim = await prisma.universityClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found');
    }

    // Validate dataRequestSchema if type is DOCUMENT_REQUEST
    if (payload.type === 'DOCUMENT_REQUEST' && !payload.dataRequestSchema) {
      throw new AppError(400, 'dataRequestSchema is required for DOCUMENT_REQUEST type');
    }

    // Get sender info for senderRole
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true, firstName: true, lastName: true },
    });

    if (!sender) {
      throw new AppError(404, 'Sender not found');
    }

    // Create the message
    const message = await prisma.claimMessage.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        claimId,
        senderId,
        senderRole: sender.role || 'USER',
        content: payload.message,
        attachments: payload.attachments || [],
        type: payload.type || 'CHAT',
        dataRequestSchema: payload.dataRequestSchema as any,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // If it's a DOCUMENT_REQUEST, update claim status to ACTION_REQUIRED
    if (payload.type === 'DOCUMENT_REQUEST' && claim.status !== ClaimStatus.ACTION_REQUIRED) {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true, lastName: true },
      });

      const auditEntry = this.createAuditEntry(
        senderId,
        `${sender?.firstName} ${sender?.lastName}`,
        'Document request sent to user',
        claim.status,
        ClaimStatus.ACTION_REQUIRED,
        'Awaiting user response to data request'
      );

      await prisma.universityClaim.update({
        where: { id: claimId },
        data: {
          status: ClaimStatus.ACTION_REQUIRED,
          auditLog: this.appendAuditLog(claim.auditLog, auditEntry) as any,
        },
      });
    }

    return message;
  }

  /**
   * Submit data in response to a request
   * @param claimId - Claim ID
   * @param userId - User ID submitting data
   * @param payload - Submission data
   */
  static async submitData(
    claimId: string,
    userId: string,
    payload: SubmitClaimDataInput
  ) {
    // Verify claim exists and belongs to user
    const claim = await prisma.universityClaim.findFirst({
      where: { 
        id: claimId,
        userId,
      },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found or you do not have permission');
    }

    // Create data submission as a message
    const submission = await prisma.claimMessage.create({
      data: {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        claimId,
        senderId: userId,
        senderRole: 'USER',
        content: 'Data submission',
        type: 'CHAT',
        submittedData: payload.submittedData as any,
        attachments: payload.documents || [],
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update claim status back to UNDER_REVIEW if it was ACTION_REQUIRED
    if (claim.status === ClaimStatus.ACTION_REQUIRED) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      const auditEntry = this.createAuditEntry(
        userId,
        `${user?.firstName} ${user?.lastName}`,
        'User submitted requested data',
        ClaimStatus.ACTION_REQUIRED,
        ClaimStatus.UNDER_REVIEW,
        'Data submitted, awaiting review'
      );

      await prisma.universityClaim.update({
        where: { id: claimId },
        data: {
          status: ClaimStatus.UNDER_REVIEW,
          auditLog: this.appendAuditLog(claim.auditLog, auditEntry) as any,
        },
      });
    }

    return submission;
  }

  /**
   * Create a new claim request
   */
  static async create(userId: string, data: CreateClaimInput) {
    // Check for existing active claim
    const existingClaim = await prisma.universityClaim.findFirst({
      where: {
        userId,
        ...(data.universityId && { universityId: data.universityId }),
        ...(data.universityGroupId && { universityGroupId: data.universityGroupId }),
        status: {
          in: [ClaimStatus.PENDING, ClaimStatus.UNDER_REVIEW, ClaimStatus.ACTION_REQUIRED],
        },
      },
    });

    if (existingClaim) {
      throw new AppError(409, 'You already have an active claim for this entity');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Get user info for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    const auditEntry = this.createAuditEntry(
      userId,
      `${user?.firstName} ${user?.lastName}`,
      'Claim created',
      undefined,
      ClaimStatus.PENDING,
      'Initial claim submission'
    );

    const claim = await prisma.universityClaim.create({
      data: {
        userId,
        universityId: data.universityId,
        universityGroupId: data.universityGroupId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        institutionalEmail: data.institutionalEmail,
        position: data.position,
        department: data.department,
        verificationDocuments: data.verificationDocuments,
        comments: data.comments,
        status: ClaimStatus.PENDING,
        expiresAt,
        auditLog: [auditEntry] as any,
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
   * Get all claims for a user
   */
  static async getUserClaims(userId: string) {
    return await prisma.universityClaim.findMany({
      where: { userId },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        ClaimMessage: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Just the latest message
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all claims (admin)
   */
  static async getAllClaims(status?: ClaimStatus) {
    return await prisma.universityClaim.findMany({
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
            slug: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Legacy review method (kept for backward compatibility)
   */
  static async reviewClaim(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    adminNotes?: string
  ) {
    const newStatus = status === 'APPROVED' ? ClaimStatus.VERIFIED : ClaimStatus.REJECTED;
    return this.updateStatus(
      id,
      newStatus,
      adminId,
      `Claim ${status.toLowerCase()} by admin`,
      adminNotes
    );
  }

  /**
   * Update a claim (user can only edit their own pending claims)
   */
  static async updateClaim(
    claimId: string,
    userId: string,
    data: Partial<{
      claimType: ClaimType;
      institutionalEmail: string;
      position: string;
      department: string;
      comments: string;
      verificationDocuments: string[];
    }>
  ) {
    // Verify claim exists and belongs to user
    const claim = await prisma.universityClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found');
    }

    if (claim.userId !== userId) {
      throw new AppError(403, 'You can only edit your own claims');
    }

    if (claim.status !== 'PENDING') {
      throw new AppError(400, 'You can only edit pending claims');
    }

    // Update the claim
    const updatedClaim = await prisma.universityClaim.update({
      where: { id: claimId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            city: true,
            state: true,
            country: true,
          },
        },
        universityGroup: {
          select: {
            id: true,
            name: true,
            universities: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedClaim;
  }

  /**
   * Delete a claim (user can only delete their own pending claims)
   */
  static async deleteClaim(claimId: string, userId: string) {
    // Verify claim exists and belongs to user
    const claim = await prisma.universityClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found');
    }

    if (claim.userId !== userId) {
      throw new AppError(403, 'You can only delete your own claims');
    }

    if (claim.status !== 'PENDING') {
      throw new AppError(400, 'You can only delete pending claims');
    }

    // Delete the claim
    await prisma.universityClaim.delete({
      where: { id: claimId },
    });

    return { success: true };
  }

  /**
   * Get all documents for a claim with their approval status
   */
  static async getClaimDocuments(claimId: string) {
    const claim = await prisma.universityClaim.findUnique({
      where: { id: claimId },
      include: {
        documentApprovals: {
          include: {
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
        },
      },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found');
    }

    // If no document approvals exist, create them from verificationDocuments
    if (claim.documentApprovals.length === 0 && claim.verificationDocuments.length > 0) {
      const documentApprovals = await Promise.all(
        claim.verificationDocuments.map((url, index) => 
          prisma.documentApproval.create({
            data: {
              claimId: claim.id,
              documentUrl: url,
              documentType: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
              documentName: `Document ${index + 1}`,
              status: 'PENDING',
            },
          })
        )
      );

      return documentApprovals;
    }

    return claim.documentApprovals;
  }

  /**
   * Review a specific document (approve or reject)
   */
  static async reviewDocument(
    documentId: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    adminNotes?: string
  ) {
    const document = await prisma.documentApproval.findUnique({
      where: { id: documentId },
      include: {
        claim: true,
      },
    });

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    // Update document status
    const updatedDocument = await prisma.documentApproval.update({
      where: { id: documentId },
      data: {
        status,
        adminNotes,
        reviewedAt: new Date(),
        reviewedById: adminId,
        canResubmit: status === 'REJECTED', // Allow resubmission if rejected
      },
      include: {
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

    // Check if all documents are reviewed
    const allDocuments = await prisma.documentApproval.findMany({
      where: { claimId: document.claimId },
    });

    const allApproved = allDocuments.every(doc => doc.status === 'APPROVED');
    const anyRejected = allDocuments.some(doc => doc.status === 'REJECTED');
    const allReviewed = allDocuments.every(doc => doc.status !== 'PENDING');

    // Update claim status based on document review results
    if (allReviewed) {
      if (allApproved) {
        await this.updateStatus(
          document.claimId,
          ClaimStatus.VERIFIED,
          adminId,
          'All documents approved',
          'All verification documents have been reviewed and approved'
        );
      } else if (anyRejected) {
        await this.updateStatus(
          document.claimId,
          ClaimStatus.ACTION_REQUIRED,
          adminId,
          'Some documents rejected',
          'One or more documents were rejected. Please review and resubmit.'
        );
      }
    }

    return updatedDocument;
  }

  /**
   * Creates a claim specifically for a data update from a Canonical Block submission.
   * This is used in Scenario 4 (Approval Workflow) when non-Super Admins submit data changes.
   * 
   * @param userId The ID of the user submitting the data (University Admin).
   * @param universityId The ID of the university being updated.
   * @param updateData An array of proposed changes (field, old, new).
   * @param blockTitle The title of the block being edited.
   * @returns The created UniversityClaim record.
   */
  static async createDataUpdateClaim(
    userId: string,
    universityId: string,
    updateData: Array<{
      field: string;
      oldValue: string | number | null;
      newValue: string | number | null;
    }>,
    blockTitle: string
  ) {
    if (updateData.length === 0) {
      throw new AppError(400, 'No data changes detected for claim submission.');
    }

    // Get the user info for the claim record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get the university info
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      select: {
        name: true,
        slug: true,
      },
    });

    if (!university) {
      throw new AppError(404, 'University not found');
    }

    // Format the changes for the comments
    const claimDetails = updateData
      .map(d => `${d.field}: "${d.oldValue}" → "${d.newValue}"`)
      .join('; ');

    const comments = `Data update submitted via block editor: "${blockTitle}". Proposed changes: ${claimDetails}`;

    // Create audit log with timestamps
    const auditLog = updateData.map(d => ({
      field: d.field,
      oldValue: d.oldValue,
      newValue: d.newValue,
      timestamp: new Date().toISOString(),
    }));

    // Create the claim record
    return prisma.universityClaim.create({
      data: {
        userId,
        universityId,
        status: ClaimStatus.PENDING,
        claimType: ClaimType.DATA_UPDATE,
        institutionalEmail: user.email,
        verificationDocuments: [],
        position: 'University Administrator',
        department: 'Data Management',
        comments,
        requesterName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        auditLog: auditLog as unknown as Prisma.InputJsonValue,
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
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Processes the approval of a DATA_UPDATE claim.
   * Atomically moves data from Draft columns to Live columns and archives the claim.
   * This is the critical operation that makes changes permanent after admin review.
   * 
   * NEW (Prompt 15): Core approval workflow - executes atomic transaction for data integrity.
   */
  static async processDataUpdateApproval(
    claimId: string,
    reviewedById: string
  ): Promise<any> {
    // 1. Fetch the claim with its university and audit log
    const claim = await prisma.universityClaim.findUnique({
      where: { id: claimId },
      include: { university: { select: { slug: true, id: true } } },
    });

    if (!claim) {
      throw new AppError(404, 'Claim not found or is not a data update claim.');
    }
    
    if (claim.claimType !== ClaimType.DATA_UPDATE) {
      throw new AppError(400, 'This claim is not a data update claim.');
    }
    
    if (claim.status !== ClaimStatus.PENDING) {
      throw new AppError(400, `Claim status is ${claim.status}. Cannot approve.`);
    }
    
    if (!claim.universityId || !claim.university?.slug) {
      throw new AppError(400, 'Claim is not linked to a valid university.');
    }

    // 2. Parse the audit log to get proposed changes
    let proposedChanges: Array<{
      field: string;
      oldValue: string | number | null;
      newValue: string | number | null;
      timestamp?: string;
    }> = [];

    try {
      const auditLogData = claim.auditLog as unknown;
      if (Array.isArray(auditLogData)) {
        proposedChanges = auditLogData;
      } else if (typeof auditLogData === 'string') {
        proposedChanges = JSON.parse(auditLogData);
      }
    } catch (err) {
      throw new AppError(400, 'Failed to parse claim audit log.');
    }

    // 3. Prepare data for atomic transaction (Draft → Live migration)
    const liveUpdateData: Record<string, any> = {};
    const draftClearData: Record<string, any> = {};

    // Define DRAFT_COLUMNS (all fields that require approval)
    const DRAFT_COLUMNS = [
      'latitudeDraft', 'longitudeDraft', 'climateZoneDraft', 'nearestAirportDraft',
      'addressDraft', 'cityDraft', 'stateDraft', 'zipCodeDraft', 'countryDraft',
      'acceptanceRateDraft', 'avgGpaDraft', 'avgSatScoreDraft', 'avgActScoreDraft',
      'gpa25thPercentileDraft', 'gpa75thPercentileDraft',
      'satMath25Draft', 'satMath75Draft', 'satVerbal25Draft', 'satVerbal75Draft',
      'actComposite25Draft', 'actComposite75Draft',
      'tuitionInStateDraft', 'tuitionOutOfStateDraft', 'roomBoardDraft',
      'booksSuppliesDraft', 'personalExpensesDraft', 'transportationDraft',
      'costOfLivingIndexDraft', 'averageAidPackageDraft', 'percentReceivingAidDraft'
    ];

    // For each proposed change, if the field is in DRAFT_COLUMNS, migrate it to live
    proposedChanges.forEach(change => {
      const field = change.field;
      const draftFieldName = `${field}Draft`;
      
      // Check if this is a draft field that should be migrated
      if (DRAFT_COLUMNS.includes(draftFieldName)) {
        // Set the new value in the LIVE column
        liveUpdateData[field] = change.newValue;
        // Clear the corresponding DRAFT column after migration
        draftClearData[draftFieldName] = null;
      }
    });

    // 4. Execute atomic transaction: Update University + Update Claim
    const [updatedUniversity, updatedClaim] = await prisma.$transaction([
      // A. Atomically update the Live columns and clear Draft columns
      prisma.university.update({
        where: { id: claim.universityId },
        data: {
          ...liveUpdateData,
          ...draftClearData,
        },
      }),

      // B. Update the Claim status to APPROVED
      prisma.universityClaim.update({
        where: { id: claimId },
        data: {
          status: ClaimStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: reviewedById,
          adminNotes: claim.adminNotes 
            ? `${claim.adminNotes}\n\nData update approved via atomic transaction.`
            : 'Data update approved. Canonical data committed to live columns.',
        },
      }),
    ]);

    // 5. Invalidate cache (crucial for ensuring next request gets fresh data)
    try {
      const { UniversityProfileService } = await import('./UniversityProfileService');
      await UniversityProfileService.invalidateProfileCache(claim.university.slug);
    } catch (cacheErr) {
      // Log cache invalidation error but don't fail the approval
      console.error('[ClaimService] Cache invalidation failed:', cacheErr);
    }

    return updatedClaim;
  }
}
