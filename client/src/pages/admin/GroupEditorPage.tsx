import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type UniversityGroup = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  universities?: { id: string; name: string }[];
};

type University = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
};

export default function GroupEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    website: '',
  });

  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch group if editing
  const { data: group, isLoading: loadingGroup } = useQuery<UniversityGroup>({
    queryKey: ['admin-group', id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data.data;
    },
    enabled: isEditMode,
  });

  // Fetch all universities for the selector
  const { data: universities = [], isLoading: loadingUniversities } = useQuery<University[]>({
    queryKey: ['all-universities'],
    queryFn: async () => {
      const res = await api.get('/universities', { params: { limit: 1000 } });
      return res.data.data;
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (group && isEditMode) {
      setFormData({
        name: group.name,
        slug: group.slug,
        description: group.description || '',
        logoUrl: group.logoUrl || '',
        website: group.website || '',
      });
      setSelectedUniversities(group.universities?.map(u => u.id) || []);
    }
  }, [group, isEditMode]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: isEditMode ? prev.slug : value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        universityIds: selectedUniversities,
      };

      if (isEditMode) {
        await api.put(`/groups/${id}`, payload);
      } else {
        await api.post('/groups', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-group', id] });
      toast.success(isEditMode ? 'Group updated successfully' : 'Group created successfully');
      navigate('/admin/groups');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save group');
    },
  });

  const toggleUniversity = (universityId: string) => {
    setSelectedUniversities(prev =>
      prev.includes(universityId)
        ? prev.filter(id => id !== universityId)
        : [...prev, universityId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }
    saveMutation.mutate();
  };

  if (isEditMode && loadingGroup) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const selectedUniversityObjects = universities.filter(u => selectedUniversities.includes(u.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/groups')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">
            {isEditMode ? 'Edit University Group' : 'Create New University Group'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {isEditMode ? `Editing: ${group?.name}` : 'Create a new collection of universities'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Group name, identifier, and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ivy League"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g., ivy-league"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
                <p className="text-xs text-gray-500">Used in URLs</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this group..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Universities</CardTitle>
            <CardDescription>Select which universities belong to this group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university-search">Search Universities</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="university-search"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-1">
              {loadingUniversities ? (
                <div className="text-center py-8 text-gray-500">Loading universities...</div>
              ) : (
                universities
                  .filter(u =>
                    searchTerm === '' ||
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.state?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((university) => (
                    <label
                      key={university.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUniversities.includes(university.id)}
                        onChange={() => toggleUniversity(university.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{university.name}</div>
                        <div className="text-xs text-gray-500">
                          {university.city}, {university.state}
                        </div>
                      </div>
                    </label>
                  ))
              )}
            </div>

            {selectedUniversityObjects.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedUniversityObjects.map((university) => (
                  <Badge key={university.id} variant="secondary" className="gap-1">
                    {university.name}
                    <button
                      type="button"
                      onClick={() => toggleUniversity(university.id)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/groups')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : isEditMode ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </form>
    </div>
  );
}
