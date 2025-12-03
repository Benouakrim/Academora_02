import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, ExternalLink, FileText, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';

type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type UniversityClaim = {
  id: string;
  status: ClaimStatus;
  requesterName: string;
  requesterEmail: string;
  position: string;
  department?: string;
  verificationDocuments: string[];
  comments?: string;
  adminNotes?: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt?: string;
  university?: {
    id: string;
    name: string;
    slug: string;
  };
  universityGroup?: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
};

type ClaimsResponse = {
  status: string;
  data: UniversityClaim[];
};

export default function AdminClaimsPage() {
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<UniversityClaim | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('PENDING');

  const { data, isLoading } = useQuery<ClaimsResponse>({
    queryKey: ['admin-claims', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/claims${params}`);
      return res.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'APPROVED' | 'REJECTED'; notes?: string }) => {
      await api.patch(`/admin/claims/${id}/review`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
      toast.success('Claim reviewed successfully');
      setSelectedClaim(null);
      setReviewAction(null);
      setAdminNotes('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to review claim');
    },
  });

  const handleReview = () => {
    if (!selectedClaim || !reviewAction) return;
    reviewMutation.mutate({
      id: selectedClaim.id,
      status: reviewAction,
      notes: adminNotes || undefined,
    });
  };

  const openReviewDialog = (claim: UniversityClaim, action: 'APPROVED' | 'REJECTED') => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setAdminNotes('');
  };

  const columns: ColumnDef<UniversityClaim>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ClaimStatus;
        const variants: Record<ClaimStatus, { badge: string; icon: LucideIcon }> = {
          PENDING: { badge: 'bg-yellow-100 text-yellow-800', icon: Clock },
          APPROVED: { badge: 'bg-green-100 text-green-800', icon: CheckCircle },
          REJECTED: { badge: 'bg-red-100 text-red-800', icon: XCircle },
        };
        const config = variants[status] || variants.PENDING;
        const Icon = config.icon;
        return (
          <Badge className={config.badge}>
            <Icon className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string);
        return <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>;
      },
    },
    {
      accessorKey: 'requesterName',
      header: 'Requester',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('requesterName') as string}</div>
          <div className="text-xs text-gray-500">{row.original.requesterEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Position',
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.getValue('position') as string}</div>
          {row.original.department && (
            <div className="text-xs text-gray-500">{row.original.department}</div>
          )}
        </div>
      ),
    },
    {
      id: 'target',
      header: 'Target',
      cell: ({ row }) => {
        const claim = row.original;
        if (claim.university) {
          return (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{claim.university.name}</span>
            </div>
          );
        }
        if (claim.universityGroup) {
          return (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{claim.universityGroup.name} (Group)</span>
            </div>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      accessorKey: 'verificationDocuments',
      header: 'Docs',
      cell: ({ row }) => {
        const docs = row.getValue('verificationDocuments') as string[];
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            {docs.length}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const claim = row.original;
        if (claim.status !== 'PENDING') {
          return (
            <div className="text-xs text-gray-500">
              {claim.reviewedAt && `Reviewed ${format(new Date(claim.reviewedAt), 'MMM d')}`}
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => openReviewDialog(claim, 'APPROVED')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => openReviewDialog(claim, 'REJECTED')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const claims = data?.data || [];
  const stats = {
    pending: claims.filter((c) => c.status === 'PENDING').length,
    approved: claims.filter((c) => c.status === 'APPROVED').length,
    rejected: claims.filter((c) => c.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">University Claims</h2>
        <p className="text-gray-600 text-sm mt-1">Review and manage university ownership requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Label>Filter:</Label>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {claims.length > 0 ? (
        <DataTable columns={columns} data={claims} />
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
            <p>There are no {statusFilter.toLowerCase()} claims at this time.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedClaim && !!reviewAction} onOpenChange={() => {
        setSelectedClaim(null);
        setReviewAction(null);
        setAdminNotes('');
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Claim Request
            </DialogTitle>
            <DialogDescription>
              Review the claim details before making a decision.
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Requester</Label>
                  <p className="font-medium">{selectedClaim.requesterName}</p>
                  <p className="text-gray-600">{selectedClaim.requesterEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Position</Label>
                  <p className="font-medium">{selectedClaim.position}</p>
                  {selectedClaim.department && (
                    <p className="text-gray-600">{selectedClaim.department}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Target</Label>
                <p className="font-medium">
                  {selectedClaim.university?.name || selectedClaim.universityGroup?.name}
                </p>
              </div>

              {selectedClaim.comments && (
                <div>
                  <Label className="text-xs text-gray-500">Requester Comments</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedClaim.comments}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-gray-500">Verification Documents</Label>
                <div className="space-y-1 mt-1">
                  {selectedClaim.verificationDocuments.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Document {idx + 1}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this decision..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedClaim(null);
              setReviewAction(null);
              setAdminNotes('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewMutation.isPending}
              className={reviewAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewMutation.isPending ? 'Processing...' : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
