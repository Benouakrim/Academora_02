# University Claims System Implementation Guide

**Status:** ✅ COMPLETE & PRODUCTION READY  
**Feature:** Claims & Verification System  
**Date:** December 9, 2025  
**Version:** 1.0  

---

## Executive Summary

A comprehensive university claim and data verification system that enables institution representatives to claim ownership of their university profile and submit data updates for admin review. Includes role-based access control, document request workflows, and complete audit logging.

**System Status: FULLY OPERATIONAL**
- ✅ Database: Complete schema with state machine
- ✅ Services: Full claim lifecycle management
- ✅ Controllers: RBAC-protected endpoints
- ✅ Communication: Multi-channel claim communication
- ✅ Audit: Complete audit trail tracking

---

## Architecture Overview

### Claim Status State Machine

```
PENDING
  ├→ UNDER_REVIEW (admin begins review)
  │   ├→ ACTION_REQUIRED (admin requests documents/data)
  │   │   └→ UNDER_REVIEW (user submits requested data)
  │   │       ├→ VERIFIED (admin approves claim)
  │   │       │   └→ ARCHIVED
  │   │       └→ REJECTED (admin rejects)
  │   │           └→ ARCHIVED
  │   └→ VERIFIED (approved immediately)
  │       └→ ARCHIVED
  └→ REJECTED (rejected immediately)
      └→ ARCHIVED
```

### Communication Flow

```
University Rep Requests Claim
    ↓
Admin Reviews Claim Documents
    ↓
Admin Requests Additional Data (if needed)
    ├→ Sends DOCUMENT_REQUEST message
    ├→ Specifies required fields
    └→ Claim status: ACTION_REQUIRED
    ↓
University Rep Submits Data
    ├→ Responds to DOCUMENT_REQUEST
    └→ Claim status: back to UNDER_REVIEW
    ↓
Admin Verifies or Rejects
    ├→ If verified: VERIFIED (unlocks admin editing)
    └→ If rejected: REJECTED
```

---

## Database Schema

**File:** `server/prisma/schema.prisma`

### Enums

```typescript
enum ClaimType {
  ACADEMIC_STAFF           // Faculty member
  ALUMNI                   // Graduate
  STUDENT                  // Current student
  ADMINISTRATIVE_STAFF     // Staff member
  DATA_UPDATE             // Data change submission (P8)
}

enum ClaimStatus {
  PENDING                  // Initial state
  UNDER_REVIEW            // Admin is reviewing
  ACTION_REQUIRED         // Awaiting user action
  VERIFIED                // Claim approved
  REJECTED                // Claim denied
  ARCHIVED                // Completed/closed
}

enum CommunicationType {
  CHAT                    // Regular message
  DOCUMENT_REQUEST        // Admin requesting docs
  INTERNAL_NOTE          // Admin-only note
}
```

### Models

#### UniversityClaim
```typescript
{
  id: String (UUID)
  
  // Claim Details
  claimType: ClaimType
  status: ClaimStatus
  universityId: String (FK)
  university: University
  userId: String (FK)
  user: User
  
  // Verification Info
  verifiedByAdminId: String? (FK)
  verifiedByAdmin: User?
  verifiedAt: DateTime?
  rejectionReason: String?
  
  // Data for Review
  documentUrls: String[]  // Cloudinary URLs
  additionalInfo: Json?   // Custom fields
  
  // Audit Trail
  auditLog: Json[]
  {
    timestamp: DateTime
    action: 'CREATED' | 'STATUS_CHANGED' | 'MESSAGE_POSTED' | 'DATA_SUBMITTED'
    oldStatus?: ClaimStatus
    newStatus?: ClaimStatus
    details: String
    actorId: String
    actorType: 'USER' | 'ADMIN'
  }
  
  // Relations
  communications: ClaimCommunication[]
  dataSubmissions: ClaimDataSubmission[]
  
  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### ClaimCommunication
```typescript
{
  id: String (UUID)
  claimId: String (FK)
  claim: UniversityClaim
  
  senderId: String (FK)
  sender: User
  
  type: CommunicationType  // CHAT | DOCUMENT_REQUEST | INTERNAL_NOTE
  message: String
  
  // For DOCUMENT_REQUEST
  dataRequestSchema: Json?  // Form fields being requested
  {
    fields: {
      [fieldName]: {
        label: String
        type: String  // 'text', 'number', 'date', 'file', etc.
        required: Boolean
        description: String?
      }
    }
  }
  
  attachments: String[]  // Cloudinary URLs
  isInternalNote: Boolean  // Only visible to admins if true
  
  createdAt: DateTime
}
```

#### ClaimDataSubmission
```typescript
{
  id: String (UUID)
  claimId: String (FK)
  claim: UniversityClaim
  
  communicationId: String (FK)
  communication: ClaimCommunication  // Original request
  
  submittedData: Json  // User's response
  {
    [fieldName]: Value  // Maps to requested fields
  }
  
  submittedAt: DateTime
  submittedBy: String (FK)
}
```

---

## Service Layer

**File:** `server/src/services/ClaimService.ts`

### Core Methods

#### Create Claim
```typescript
static async createClaim(
  userId: string,
  universityId: string,
  claimType: ClaimType,
  documentUrls?: string[],
  additionalInfo?: Record<string, any>
): Promise<UniversityClaim>
```

**Flow:**
1. Validate user and university exist
2. Check for existing claims by user on this university
3. Create UniversityClaim with PENDING status
4. Create initial audit log entry
5. Return complete claim record

#### Update Claim Status
```typescript
static async updateStatus(
  claimId: string,
  newStatus: ClaimStatus,
  adminId: string,
  rejectionReason?: string
): Promise<UniversityClaim>
```

**Validation:**
- Only valid status transitions allowed
- Admin authentication required
- Track admin who made change
- Create audit log entry
- If VERIFIED: Grant user as owner

**State Machine Validation:**
```typescript
const VALID_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  PENDING: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['ACTION_REQUIRED', 'VERIFIED', 'REJECTED'],
  ACTION_REQUIRED: ['UNDER_REVIEW', 'REJECTED'],
  VERIFIED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  ARCHIVED: []
};
```

#### Post Message
```typescript
static async postMessage(
  claimId: string,
  senderId: string,
  type: CommunicationType,
  message: string,
  dataRequestSchema?: Json,
  attachments?: string[],
  isInternalNote?: boolean
): Promise<ClaimCommunication>
```

**Behavior:**
- Only admins can send DOCUMENT_REQUEST or INTERNAL_NOTE
- Users can only send CHAT messages
- If DOCUMENT_REQUEST: Auto-transition to ACTION_REQUIRED
- Create communication record with all metadata
- Optionally include form schema for data request

**Example Data Request:**
```json
{
  "fields": {
    "accreditation_letter": {
      "label": "Accreditation Letter",
      "type": "file",
      "required": true,
      "description": "Upload your institution's accreditation letter"
    },
    "founding_year": {
      "label": "Year Founded",
      "type": "number",
      "required": true,
      "description": "Enter the year your institution was founded"
    }
  }
}
```

#### Submit Data
```typescript
static async submitData(
  claimId: string,
  userId: string,
  communicationId: string,
  submittedData: Record<string, any>
): Promise<ClaimDataSubmission>
```

**Flow:**
1. Validate claim exists and user is claimant
2. Validate submitted data against request schema
3. Create ClaimDataSubmission record
4. Auto-transition status to UNDER_REVIEW
5. Create audit log entry
6. Notify admin of new submission

#### List Claims
```typescript
// User's own claims
static async getUserClaims(userId: string): Promise<UniversityClaim[]>

// All claims (admin only)
static async getAllClaims(
  adminId: string,
  filters?: {
    status?: ClaimStatus
    universityId?: string
    claimType?: ClaimType
  }
): Promise<UniversityClaim[]>
```

---

## Controller Layer

**File:** `server/src/controllers/ClaimController.ts`

### Endpoints

#### User Endpoints

**POST /api/claims/request**
```typescript
body: {
  universityId: string,
  claimType: ClaimType,
  documentUrls?: string[],
  additionalInfo?: Record<string, any>
}
returns: UniversityClaim
```

**GET /api/claims/my-claims**
```typescript
returns: UniversityClaim[]
// User sees only their own claims
```

**GET /api/claims/:claimId**
```typescript
returns: UniversityClaim (with full communications/submissions)
// User can view own claims or admin can view any
```

**POST /api/claims/:claimId/submit-data**
```typescript
body: {
  communicationId: string,
  submittedData: Record<string, any>
}
returns: ClaimDataSubmission
```

#### Admin Endpoints

**GET /api/claims/admin/all**
```typescript
query: {
  status?: ClaimStatus,
  universityId?: string,
  claimType?: ClaimType
}
returns: UniversityClaim[]
// Admin sees all claims with filters
```

**PATCH /api/claims/:claimId/status**
```typescript
body: {
  status: ClaimStatus,
  rejectionReason?: string
}
returns: UniversityClaim
```

**POST /api/claims/:claimId/message**
```typescript
body: {
  type: CommunicationType,
  message: string,
  dataRequestSchema?: Json,
  attachments?: string[]
}
returns: ClaimCommunication
```

---

## Approval Workflow Integration (P8)

### Data Update Claims

When non-admins attempt to update Hard Block (canonical) data, they trigger a DATA_UPDATE claim:

```typescript
// In UniversityBlockService.updateCanonicalBlock()

if (!isSuperAdmin && hasChanges) {
  // Create data update claim instead of direct update
  await ClaimService.createDataUpdateClaim(
    userId,
    universityId,
    changedFields,  // [{ field, oldValue, newValue }, ...]
    blockTitle
  );
  
  throw new PendingApprovalError(
    'Your data update has been submitted for admin review'
  );
}
```

### Claim Data Structure for Updates

```typescript
{
  claimType: 'DATA_UPDATE',
  status: 'UNDER_REVIEW',
  additionalInfo: {
    blockTitle: 'Admissions Range',
    changes: [
      {
        field: 'acceptanceRate',
        oldValue: 10,
        newValue: 12,
        timestamp: '2025-12-09T10:30:00Z'
      },
      {
        field: 'avgSatScore',
        oldValue: 1450,
        newValue: 1480,
        timestamp: '2025-12-09T10:30:00Z'
      }
    ]
  }
}
```

---

## Frontend Integration

### Pages

**My Claims** (`/dashboard/claims`)
```typescript
- List of user's claims
- Status badges with color coding
- Action buttons per status:
  - PENDING: View claim
  - UNDER_REVIEW: View claim
  - ACTION_REQUIRED: Respond to request
  - VERIFIED: View (read-only)
  - REJECTED: View rejection reason
```

**Claim Detail** (`/dashboard/claims/:id`)
```typescript
- Claim information
- Communication thread
- Document submissions
- Data request forms (if ACTION_REQUIRED)
- Submit data button
```

**Admin Claim Review** (`/admin/claims`)
```typescript
- List of all pending claims
- Filter by status, type, university
- Bulk actions
- Request documents button
- Approve/Reject buttons
```

---

## Validation Schemas

**File:** `shared/schemas/claimSchemas.ts`

```typescript
export const createClaimSchema = z.object({
  universityId: z.string().uuid(),
  claimType: z.nativeEnum(ClaimType),
  documentUrls: z.array(z.string().url()).optional(),
  additionalInfo: z.record(z.any()).optional()
});

export const postMessageSchema = z.object({
  type: z.nativeEnum(CommunicationType),
  message: z.string().min(1).max(5000),
  dataRequestSchema: z.record(z.any()).optional(),
  attachments: z.array(z.string().url()).optional()
});

export const submitClaimDataSchema = z.object({
  communicationId: z.string().uuid(),
  submittedData: z.record(z.any())
});
```

---

## Audit Logging

All claim operations recorded:

```typescript
auditLog: [
  {
    timestamp: '2025-12-09T10:00:00Z',
    action: 'CREATED',
    newStatus: 'PENDING',
    details: 'Claim created for Academic Staff',
    actorId: 'user-123',
    actorType: 'USER'
  },
  {
    timestamp: '2025-12-09T11:30:00Z',
    action: 'STATUS_CHANGED',
    oldStatus: 'PENDING',
    newStatus: 'UNDER_REVIEW',
    details: 'Admin began review',
    actorId: 'admin-456',
    actorType: 'ADMIN'
  },
  {
    timestamp: '2025-12-09T14:00:00Z',
    action: 'MESSAGE_POSTED',
    details: 'Admin requested accreditation documents',
    actorId: 'admin-456',
    actorType: 'ADMIN'
  }
]
```

---

## Implementation Checklist

- [x] Database schema with ClaimType and ClaimStatus enums
- [x] UniversityClaim model with state machine
- [x] ClaimCommunication model for messaging
- [x] ClaimDataSubmission model for responses
- [x] ClaimService with all core methods
- [x] ClaimController with RBAC-protected endpoints
- [x] Validation schemas with Zod
- [x] Audit logging on all state changes
- [x] Data update claim integration (P8)
- [x] Frontend pages for users and admins
- [x] No TypeScript errors
- [x] 100% type coverage

---

## Deployment Checklist

- [x] Database migrations applied
- [x] All schema migrations included
- [x] API endpoints tested
- [x] RBAC authorization verified
- [x] Audit logging verified
- [x] Communication flow tested
- [x] Data submission validation working
- [x] Frontend routes added
- [x] Navigation links added
- [x] Documentation complete
- [x] Ready for production deployment

---

## File References

**Backend:**
- `server/src/services/ClaimService.ts` - Complete service
- `server/src/controllers/ClaimController.ts` - API endpoints
- `server/prisma/schema.prisma` - Database models

**Frontend:**
- `client/src/pages/dashboard/ClaimsPage.tsx` - User claims
- `client/src/pages/dashboard/ClaimDetailPage.tsx` - Claim detail
- `client/src/pages/admin/ClaimsAdminPage.tsx` - Admin review

**Shared:**
- `shared/schemas/claimSchemas.ts` - Validation schemas

---

## Support & Questions

For detailed implementation questions, refer to:
- ClaimService for business logic
- ClaimController for API contracts
- Schema files for validation rules
