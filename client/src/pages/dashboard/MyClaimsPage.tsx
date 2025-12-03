import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ExternalLink, FileText, Building2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type MyClaim = {
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
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
};

type MyClaimsResponse = {
  status: string;
  data: MyClaim[];
};

export default function MyClaimsPage() {
  const { data, isLoading } = useQuery<MyClaimsResponse>({
    queryKey: ['my-claims'],
    queryFn: async () => {
      const res = await api.get('/claims/my-requests');
      return res.data;
    },
  });

  const claims = data?.data || [];

  const getStatusConfig = (status: ClaimStatus) => {
    const configs = {
      PENDING: {
        badge: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        title: 'Under Review',
        message: 'Your claim is being reviewed by our team. We typically respond within 48 hours.',
      },
      APPROVED: {
        badge: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        title: 'Approved',
        message: 'Your claim has been approved! You now have management access to this institution.',
      },
      REJECTED: {
        badge: 'bg-red-100 text-red-800',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        title: 'Rejected',
        message: 'Your claim was not approved. Please see the notes below for more information.',
      },
    };
    return configs[status];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My Claim Requests</h2>
        <p className="text-gray-600 text-sm mt-1">Track the status of your university ownership claims</p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Submitted</h3>
            <p className="text-gray-500 mb-6">
              You haven't submitted any university ownership claims yet. Submit a claim to manage your institution's profile.
            </p>
            <Link to="/university-claims/claim">
              <Button>Submit a Claim</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const config = getStatusConfig(claim.status);
            const StatusIcon = config.icon;

            return (
              <Card key={claim.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {claim.university?.name || claim.universityGroup?.name}
                        </CardTitle>
                        <Badge className={config.badge}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {claim.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Submitted {format(new Date(claim.createdAt), 'MMMM d, yyyy')}
                        {claim.reviewedAt && ` • Reviewed ${format(new Date(claim.reviewedAt), 'MMMM d, yyyy')}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Message */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${config.bg}`}>
                    <StatusIcon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                    <div>
                      <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{config.message}</p>
                    </div>
                  </div>

                  {/* Claim Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Your Position:</span>
                      <p className="font-medium">{claim.position}</p>
                      {claim.department && <p className="text-gray-600">{claim.department}</p>}
                    </div>
                    <div>
                      <span className="text-gray-500">Contact Email:</span>
                      <p className="font-medium">{claim.requesterEmail}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  {claim.comments && (
                    <div>
                      <span className="text-sm text-gray-500">Your Comments:</span>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{claim.comments}</p>
                    </div>
                  )}

                  {/* Admin Notes (if rejected or approved with notes) */}
                  {claim.adminNotes && (
                    <div>
                      <span className="text-sm text-gray-500">Admin Notes:</span>
                      <p className="text-sm mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        {claim.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Verification Documents */}
                  <div>
                    <span className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      Verification Documents ({claim.verificationDocuments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {claim.verificationDocuments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Target Link */}
                  <div className="pt-2 border-t">
                    {claim.university && (
                      <Link
                        to={`/university/${claim.university.slug}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Building2 className="h-4 w-4" />
                        View University Page
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
          <p className="text-sm text-blue-800">
            If you have questions about your claim or need to provide additional documentation, please contact us at{' '}
            <a href="mailto:support@academora.com" className="underline font-medium">
              support@academora.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
