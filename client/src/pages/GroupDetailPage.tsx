import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Users, DollarSign, GraduationCap, ArrowLeft, ExternalLink } from 'lucide-react';
import GroupHeader from '@/components/groups/GroupHeader';
import GroupMetrics from '@/components/groups/GroupMetrics';
import type { UniversityGroupDetail } from '@shared/types';

type University = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  acceptanceRate?: number;
  tuitionOutState?: number;
  studentPopulation?: number;
};

type GroupDetailResponse = {
  status: string;
  data: UniversityGroupDetail;
};

export default function GroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trackPageView } = useAnalyticsTracking();

  const { data, isLoading, error } = useQuery<GroupDetailResponse>({
    queryKey: ['group-detail', slug],
    queryFn: async () => {
      const res = await api.get(`/groups/slug/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  // Track group page view
  useEffect(() => {
    if (data?.data?.id && slug) {
      trackPageView({
        entityType: 'group',
        entityId: data.data.id,
        title: data.data.name,
        metadata: {
          slug,
          memberCount: (data.data as any).memberCount,
        }
      });
    }
  }, [data?.data?.id, data?.data?.name, slug, trackPageView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-16 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
              <p className="text-gray-500 mb-6">The university group you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/groups')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Groups
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const group = data.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <GroupHeader group={group} />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/groups')}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Groups
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="metrics" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start">
            <TabsTrigger value="metrics" className="h-10 px-6 rounded-md">Metrics & Statistics</TabsTrigger>
            <TabsTrigger value="universities" className="h-10 px-6 rounded-md">
              Member Universities ({group.universities.length})
            </TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <GroupMetrics group={group} />
          </TabsContent>

          {/* Universities Tab */}
          <TabsContent value="universities">
            {group.universities.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No universities yet</h3>
                  <p className="text-gray-500">This group doesn't have any universities assigned yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.universities.map((university) => (
                  <Card
                    key={university.id}
                    className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-300"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {university.logoUrl ? (
                          <img
                            src={university.logoUrl}
                            alt={university.name}
                            className="h-14 w-14 object-contain rounded"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center">
                            <GraduationCap className="h-7 w-7 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary-600 transition-colors line-clamp-2">
                            {university.name}
                          </CardTitle>
                          {(university.city || university.state) && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {university.city}
                                {university.city && university.state && ', '}
                                {university.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {university.acceptanceRate !== null && university.acceptanceRate !== undefined && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{(university.acceptanceRate * 100).toFixed(0)}% accept</span>
                          </div>
                        )}
                        {university.tuitionOutState && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>${(university.tuitionOutState / 1000).toFixed(0)}k/yr</span>
                          </div>
                        )}
                        {university.studentPopulation && (
                          <div className="flex items-center gap-2 text-gray-600 col-span-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>{university.studentPopulation.toLocaleString()} students</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <Link to={`/university/${university.slug}`} className="block">
                        <Button variant="outline" className="w-full group-hover:bg-primary-50 group-hover:border-primary-300">
                          <span>View Details</span>
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
