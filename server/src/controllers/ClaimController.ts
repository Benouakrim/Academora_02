import { Request, Response, NextFunction } from 'express';
import { ClaimService } from '../services/ClaimService';
import { AppError } from '../utils/AppError';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma';
import type { 
  CreateClaimInput,
  UpdateClaimStatusInput,
  PostMessageInput,
  SubmitClaimDataInput 
} from '../../../shared/schemas/claimSchemas';

/**
 * Get userId from request (assumes authentication middleware has run)
 */
const getUserId = async (req: Request) => {
  const clerkId = typeof (req as any).auth === 'function' ? (req as any).auth()?.userId : undefined;
  if (!clerkId) throw new AppError(401, 'Unauthorized: Missing Clerk ID');
  
  const user = await prisma.user.findUnique({ 
    where: { clerkId }, 
    select: { id: true, role: true } 
  });
  
  if (!user) throw new AppError(404, 'User profile not found');
  return user;
};

/**
 * Check if user is admin
 */
const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Create a new claim request
 * POST /api/claims/request
 */
export const requestClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = await getUserId(req);
    const data = req.body as CreateClaimInput;
    
    const newClaim = await ClaimService.create(userId, data);
    
    res.status(201).json({
      status: 'success',
      data: newClaim,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's own claims
 * GET /api/claims/my-claims
 */
export const getMyClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = await getUserId(req);
    const claims = await ClaimService.getUserClaims(userId);
    
    res.status(200).json({ 
      status: 'success', 
      data: claims 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed claim information
 * GET /api/claims/:id
 * Access: Owner of the claim OR Admin
 */
export const getClaimDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = await getUserId(req);
    
    const claim = await ClaimService.getClaimDetails(id);
    
    // Check ownership or admin access
    if (claim.userId !== userId && !isAdmin(role)) {
      throw new AppError(403, 'You do not have permission to view this claim');
    }
    
    res.status(200).json({
      status: 'success',
      data: claim,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update claim status (Admin only)
 * PATCH /api/claims/:id/status
 */
export const updateClaimStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { id: adminId, role } = await getUserId(req);
    
    // Admin check
    if (!isAdmin(role)) {
      throw new AppError(403, 'Only admins can update claim status');
    }
    
    const { status, adminNotes, auditNote } = req.body as UpdateClaimStatusInput;
    
    const updatedClaim = await ClaimService.updateStatus(
      id,
      status,
      adminId,
      auditNote,
      adminNotes
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedClaim,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Post a message to a claim (chat or document request)
 * POST /api/claims/:id/message
 * Access: Claim owner OR Admin
 */
export const postMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: claimId } = req.params;
    const { id: userId, role } = await getUserId(req);
    
    // Verify access
    const claim = await ClaimService.getClaimDetails(claimId);
    if (claim.userId !== userId && !isAdmin(role)) {
      throw new AppError(403, 'You do not have permission to message this claim');
    }
    
    // Only admins can send DOCUMENT_REQUEST or INTERNAL_NOTE
    const payload = req.body as PostMessageInput;
    if ((payload.type === 'DOCUMENT_REQUEST' || payload.isInternalNote) && !isAdmin(role)) {
      throw new AppError(403, 'Only admins can send document requests or internal notes');
    }
    
    const message = await ClaimService.postMessage(claimId, userId, payload);
    
    res.status(201).json({
      status: 'success',
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit data in response to a document request
 * POST /api/claims/:id/submit-data
 * Access: Claim owner only
 */
export const submitClaimData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: claimId } = req.params;
    const { id: userId } = await getUserId(req);
    
    const payload = req.body as SubmitClaimDataInput;
    const submission = await ClaimService.submitData(claimId, userId, payload);
    
    res.status(201).json({
      status: 'success',
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a claim (user can edit their own pending claims)
 * PATCH /api/claims/:id
 */
export const updateClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = await getUserId(req);
    const { id } = req.params;
    const data = req.body;

    const updatedClaim = await ClaimService.updateClaim(id, userId, data);

    res.status(200).json({
      status: 'success',
      data: updatedClaim,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a claim (user can delete their own pending claims)
 * DELETE /api/claims/:id
 */
export const deleteClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = await getUserId(req);
    const { id } = req.params;

    await ClaimService.deleteClaim(id, userId);

    res.status(200).json({
      status: 'success',
      message: 'Claim deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all claims (Admin only)
 * GET /api/admin/claims
 */
export const getAllClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = await getUserId(req);
    
    if (!isAdmin(role)) {
      throw new AppError(403, 'Admin access required');
    }
    
    const { status } = req.query;
    const claims = await ClaimService.getAllClaims(status as any);
    
    res.status(200).json({ 
      status: 'success', 
      data: claims 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Legacy review claim endpoint (kept for backward compatibility)
 * PATCH /api/admin/claims/:id/review
 */
export const reviewClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: adminId, role } = await getUserId(req);
    
    if (!isAdmin(role)) {
      throw new AppError(403, 'Admin access required');
    }
    
    const { id } = req.params;
    const { status, adminNotes } = req.body as { status: 'APPROVED' | 'REJECTED', adminNotes?: string };

    const updatedClaim = await ClaimService.reviewClaim(id, status, adminId, adminNotes);

    res.status(200).json({ 
      status: 'success', 
      data: updatedClaim 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all documents for a claim with their approval status
 * GET /api/admin/claims/:id/documents
 */
export const getClaimDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = await getUserId(req);
    
    if (!isAdmin(role)) {
      throw new AppError(403, 'Admin access required');
    }
    
    const { id } = req.params;
    const documents = await ClaimService.getClaimDocuments(id);

    res.status(200).json({ 
      status: 'success', 
      data: documents 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Review a specific document (approve, reject, or request replacement)
 * PATCH /api/admin/documents/:id/review
 */
export const reviewDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: adminId, role } = await getUserId(req);
    
    if (!isAdmin(role)) {
      throw new AppError(403, 'Admin access required');
    }
    
    const { id } = req.params;
    const { status, adminNotes } = req.body as { 
      status: 'APPROVED' | 'REJECTED'; 
      adminNotes?: string 
    };

    const updatedDocument = await ClaimService.reviewDocument(id, status, adminId, adminNotes);

    res.status(200).json({ 
      status: 'success', 
      data: updatedDocument 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin action to approve a specific DATA_UPDATE claim.
 * Moves data from Draft to Live columns atomically.
 * Restricted to ADMIN role only.
 * 
 * NEW (Prompt 15): Core approval endpoint for moderated data updates.
 * 
 * PUT /api/claims/:id/approve-data
 */
export const approveDataUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId, role } = await getUserId(req);
    const { id: claimId } = req.params;

    // Only Super Admins can approve data updates
    if (!isAdmin(role)) {
      throw new AppError(403, 'Admin access required to approve data updates.');
    }

    if (!userId) {
      throw new AppError(401, 'Reviewer identity is missing.');
    }

    // Call the service method to perform atomic approval transaction
    const updatedClaim = await ClaimService.processDataUpdateApproval(
      claimId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Canonical data updated successfully and claim approved.',
      data: updatedClaim,
    });
  } catch (err) {
    next(err);
  }
};
