import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Users, ArrowRight } from 'lucide-react';

type UniversityGroup = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  _count: {
    universities: number;
  };
};

type GroupsResponse = {
  status: string;
  data: UniversityGroup[];
};

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<GroupsResponse>({
    queryKey: ['university-groups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data;
    },
  });

  const groups = data?.data || [];
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore University Collections
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Discover curated groups of universities based on rankings, regions, and characteristics
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredGroups.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'No university groups are available yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchQuery ? `Search Results (${filteredGroups.length})` : `All Groups (${filteredGroups.length})`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary-300"
                >
                  <Link to={`/groups/${group.slug}`}>
                    <CardHeader>
                      <div className="flex items-start gap-4 mb-3">
                        {group.logoUrl ? (
                          <img
                            src={group.logoUrl}
                            alt={group.name}
                            className="h-16 w-16 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
                            {group.name}
                          </CardTitle>
                          <Badge variant="outline" className="mt-2">
                            <Users className="h-3 w-3 mr-1" />
                            {group._count.universities} {group._count.universities === 1 ? 'University' : 'Universities'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {group.description ? (
                        <CardDescription className="text-sm line-clamp-3 mb-4">
                          {group.description}
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-sm text-gray-400 mb-4 italic">
                          No description available
                        </CardDescription>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm font-medium text-primary-600 group-hover:underline">
                          Explore Universities
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Use our advanced search to explore thousands of universities by location, major, cost, and more.
            </p>
            <Link to="/search">
              <Button size="lg" className="gap-2">
                <Search className="h-5 w-5" />
                Search All Universities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
