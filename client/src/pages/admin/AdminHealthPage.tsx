import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import clientPkg from '../../../package.json'

type SyncStatus = {
  healthy: boolean;
  missingInNeon: number;
  missingInClerk: number;
  roleMismatches: number;
  sample: Array<{
    clerkId: string;
    neonUser?: any;
    clerkUser?: any;
    issue?: string;
  }>;
};

export default function AdminHealthPage() {
  const deps = clientPkg.dependencies || {}
  const reactVersion = deps.react
  const rechartsVersion = deps.recharts
  const clerkVersion = deps['@clerk/clerk-react']
  const mismatches: string[] = []

  // Simple heuristic checks
  if (reactVersion && reactVersion.startsWith('19')) {
    mismatches.push('React 19 detected; some libs may expect React 18.')
  }
  if (!deps['react-is']) {
    mismatches.push('react-is not explicitly installed (may cause chart issues).')
  }

  const [syncStatusData, setSyncStatusData] = useState<SyncStatus | null>(null);
  const [cleanupOrphaned, setCleanupOrphaned] = useState(false);

  // Fetch sync status
  const { refetch: checkSyncStatus, isFetching: isCheckingSync } = useQuery({
    queryKey: ['admin-sync-status'],
    queryFn: async () => {
      const res = await api.get('/admin/sync-status');
      setSyncStatusData(res.data.data);
      return res.data.data;
    },
    enabled: false,
  });

  // Reconcile mutation
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/reconcile', { cleanupOrphaned });
      return res.data;
    },
    onSuccess: (data) => {
      const result = data.data;
      const message = `Reconciliation complete! Created: ${result.created}, Updated: ${result.updated}${result.rolesSynced ? `, Roles Synced: ${result.rolesSynced}` : ''}${result.deleted ? `, Deleted: ${result.deleted}` : ''}`;
      toast.success(message);
      // Refetch sync status after reconciliation
      setTimeout(() => {
        checkSyncStatus();
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Reconciliation failed');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">System Health</h2>
        <p className="text-slate-600">Operational overview and status checks.</p>
      </div>

      {mismatches.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">Version Warnings</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
            {mismatches.map(m => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Clerk-Neon Data Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                onClick={() => checkSyncStatus()}
                disabled={isCheckingSync}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingSync ? 'animate-spin' : ''}`} />
                Check Sync Status
              </Button>
              <Button
                onClick={() => reconcileMutation.mutate()}
                disabled={reconcileMutation.isPending}
                variant="default"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reconcileMutation.isPending ? 'animate-spin' : ''}`} />
                {reconcileMutation.isPending ? 'Reconciling...' : 'Run Reconciliation'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 pl-1">
              <Checkbox 
                id="cleanupOrphaned" 
                checked={cleanupOrphaned}
                onCheckedChange={(checked) => setCleanupOrphaned(checked === true)}
              />
              <Label 
                htmlFor="cleanupOrphaned" 
                className="text-sm font-normal cursor-pointer"
              >
                Delete orphaned users (users in Neon but not in Clerk)
              </Label>
            </div>
          </div>

          {syncStatusData && (
            <div className="space-y-3 mt-4">
              <div className={`p-4 rounded-lg ${syncStatusData.healthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {syncStatusData.healthy ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h4 className={`font-semibold ${syncStatusData.healthy ? 'text-green-900' : 'text-red-900'}`}>
                    {syncStatusData.healthy ? 'Sync Status: Healthy' : 'Sync Status: Issues Detected'}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 mb-1">Missing in Neon</div>
                  <div className="text-2xl font-bold">{syncStatusData.missingInNeon}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 mb-1">Missing in Clerk</div>
                  <div className="text-2xl font-bold">{syncStatusData.missingInClerk}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 mb-1">Role Mismatches</div>
                  <div className="text-2xl font-bold">{syncStatusData.roleMismatches}</div>
                </div>
              </div>

              {syncStatusData.sample && syncStatusData.sample.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">Sample Issues</h5>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {syncStatusData.sample.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{item.issue || 'Data inconsistency detected'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Reconciliation syncs all Clerk users to the Neon database and ensures role consistency.
            This is a heavy operation and should be run during off-peak hours.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">API</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Database</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Auth (Clerk)</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
          <p className="mt-3 text-xs text-slate-600">Clerk v{clerkVersion}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Background Jobs</h3>
          <p className="mt-2 text-slate-700 bg-slate-100 inline-block rounded px-2 py-1 text-sm">No jobs configured</p>
        </div>
        <div className="rounded-lg border bg-white p-4 col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold">Key Library Versions</h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="rounded border p-2">React <span className="font-mono">{reactVersion}</span></div>
            <div className="rounded border p-2">Recharts <span className="font-mono">{rechartsVersion}</span></div>
            <div className="rounded border p-2">react-is <span className="font-mono">{deps['react-is']}</span></div>
            <div className="rounded border p-2">Clerk <span className="font-mono">{clerkVersion}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
