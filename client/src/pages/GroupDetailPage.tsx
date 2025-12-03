import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, DollarSign, GraduationCap, ArrowLeft, ExternalLink } from 'lucide-react';

type University = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  acceptanceRate?: number;
  avgCostOfAttendance?: number;
  studentPopulation?: number;
};

type GroupDetail = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  universities: University[];
};

type GroupDetailResponse = {
  status: string;
  data: GroupDetail;
};

export default function GroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<GroupDetailResponse>({
    queryKey: ['group-detail', slug],
    queryFn: async () => {
      const res = await api.get(`/groups/slug/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/groups')}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Groups
          </Button>

          <div className="flex items-start gap-6">
            {group.logoUrl ? (
              <img
                src={group.logoUrl}
                alt={group.name}
                className="h-24 w-24 object-contain rounded-lg bg-white p-3"
              />
            ) : (
              <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{group.name}</h1>
              {group.description && (
                <p className="text-xl text-primary-100 max-w-3xl">{group.description}</p>
              )}
              <Badge variant="outline" className="mt-4 bg-white/20 text-white border-white/40">
                <Users className="h-4 w-4 mr-2" />
                {group.universities.length} {group.universities.length === 1 ? 'University' : 'Universities'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Universities Grid */}
      <div className="container mx-auto px-4 py-12">
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
                    {university.avgCostOfAttendance && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${(university.avgCostOfAttendance / 1000).toFixed(0)}k/yr</span>
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
      </div>
    </div>
  );
}
