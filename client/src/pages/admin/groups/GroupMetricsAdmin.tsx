import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Calculator,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface MetricConfig {
  key: string;
  label: string;
  category: string;
  calculable: boolean; // Whether this metric can be calculated from universities
}

const METRIC_CONFIGS: MetricConfig[] = [
  // A. Identity & Overview
  { key: 'numberOfCampuses', label: 'Number of Campuses', category: 'Identity', calculable: true },
  { key: 'totalStudentPopulation', label: 'Total Students', category: 'Identity', calculable: true },
  { key: 'totalStaffCount', label: 'Total Staff', category: 'Identity', calculable: false },
  
  // B. Academics
  { key: 'fieldsOfStudy', label: 'Fields of Study', category: 'Academics', calculable: true },
  { key: 'programQualityScore', label: 'Program Quality Score', category: 'Academics', calculable: false },
  { key: 'graduationRate', label: 'Graduation Rate', category: 'Academics', calculable: true },
  
  // C. Admissions
  { key: 'tuitionRangeMin', label: 'Tuition Range (Min)', category: 'Admissions', calculable: true },
  { key: 'tuitionRangeMax', label: 'Tuition Range (Max)', category: 'Admissions', calculable: true },
  
  // D. Rankings
  { key: 'employerReputationScore', label: 'Employer Reputation', category: 'Rankings', calculable: false },
  { key: 'researchReputationScore', label: 'Research Reputation', category: 'Rankings', calculable: false },
  
  // E. Research
  { key: 'researchCentersCount', label: 'Research Centers', category: 'Research', calculable: true },
  { key: 'researchBudget', label: 'Research Budget', category: 'Research', calculable: true },
  
  // F. Student Life
  { key: 'campusInfrastructureRating', label: 'Infrastructure Rating', category: 'Student Life', calculable: true },
  { key: 'librariesCount', label: 'Libraries Count', category: 'Student Life', calculable: true },
  
  // G. International
  { key: 'internationalStudentsPct', label: 'International Students %', category: 'International', calculable: true },
  
  // H. Financial
  { key: 'operationalBudget', label: 'Operational Budget', category: 'Financial', calculable: true },
  
  // I. Outcomes
  { key: 'employmentRate', label: 'Employment Rate', category: 'Outcomes', calculable: true },
  { key: 'medianSalary', label: 'Median Salary', category: 'Outcomes', calculable: true },
];

export default function GroupMetricsAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [metricModes, setMetricModes] = useState<Record<string, 'static' | 'dynamic'>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch group details
  const { data: groupData, isLoading } = useQuery({
    queryKey: ['admin-group', id],
    queryFn: async () => {
      const { data } = await api.get(`/groups/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  // Initialize metric modes from group data
  useState(() => {
    if (groupData?.metricModes) {
      setMetricModes(groupData.metricModes);
    }
  });

  // Update metric modes mutation
  const updateModesMutation = useMutation({
    mutationFn: async (modes: Record<string, string>) => {
      const { data } = await api.put(`/groups/${id}/metric-modes`, { metricModes: modes });
      return data;
    },
    onSuccess: () => {
      toast.success('Metric modes updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-group', id] });
      setHasChanges(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update metric modes');
    },
  });

  // Recalculate metrics mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/groups/${id}/recalculate`);
      return data;
    },
    onSuccess: () => {
      toast.success('Metrics recalculated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-group', id] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to recalculate metrics');
    },
  });

  const handleModeToggle = (metricKey: string, isStatic: boolean) => {
    const newMode = isStatic ? 'static' : 'dynamic';
    setMetricModes(prev => ({
      ...prev,
      [metricKey]: newMode,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateModesMutation.mutate(metricModes);
  };

  const handleRecalculate = () => {
    if (confirm('This will recalculate all dynamic metrics. Continue?')) {
      recalculateMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Group not found</h3>
            <Button onClick={() => navigate('/admin/groups')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group metrics by category
  const metricsByCategory = METRIC_CONFIGS.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MetricConfig[]>);

  const currentMode = (key: string) => metricModes[key] || 'dynamic';
  const isStatic = (key: string) => currentMode(key) === 'static';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/groups')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
          <h1 className="text-3xl font-bold">{groupData.name}</h1>
          <p className="text-muted-foreground">Manage metric calculation modes</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={recalculateMutation.isPending}
          >
            {recalculateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate All
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateModesMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateModesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Dynamic Mode</p>
                <p className="text-xs text-muted-foreground">Calculated from member universities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-sm">Static Mode</p>
                <p className="text-xs text-muted-foreground">Admin-provided fixed value</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Configuration */}
      <Tabs defaultValue={Object.keys(metricsByCategory)[0]} className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          {Object.keys(metricsByCategory).map(category => (
            <TabsTrigger key={category} value={category} className="px-6 py-2">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(metricsByCategory).map(([category, metrics]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category} Metrics</CardTitle>
                <CardDescription>
                  Configure how these metrics are calculated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map(metric => (
                    <div
                      key={metric.key}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{metric.label}</p>
                          {!metric.calculable && (
                            <Badge variant="outline" className="text-xs">
                              Not Calculable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {metric.calculable
                            ? isStatic(metric.key)
                              ? 'Using admin-provided static value'
                              : 'Automatically calculated from universities'
                            : 'Must be manually set (no calculation available)'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isStatic(metric.key) ? (
                            <Lock className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm font-medium min-w-[70px]">
                            {isStatic(metric.key) ? 'Static' : 'Dynamic'}
                          </span>
                        </div>
                        <Switch
                          checked={isStatic(metric.key)}
                          onCheckedChange={(checked) => handleModeToggle(metric.key, checked)}
                          disabled={!metric.calculable}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">You have unsaved changes</span>
          <Button size="sm" variant="secondary" onClick={handleSave}>
            Save Now
          </Button>
        </div>
      )}
    </div>
  );
}
