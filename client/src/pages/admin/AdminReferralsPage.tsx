import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Download, Users, TrendingUp, Gift, Code, Clock } from 'lucide-react'

type ReferralMetrics = {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewardsGiven: number
  activeCodes: number
  uniqueReferrers: number
}

type Referral = {
  id: string
  referrerId: string
  referredUserId: string
  status: 'PENDING' | 'COMPLETED'
  createdAt: string
  referrer: { firstName: string; lastName: string; email: string }
  referredUser: { firstName: string; lastName: string; email: string }
}

type ReferralCode = {
  code: string
  userId: string
  user: { firstName: string; lastName: string; email: string }
  isActive: boolean
}

type TopReferrer = {
  id: string
  firstName: string
  lastName: string
  email: string
  referralCount: number
  completedCount: number
}

type SystemSettings = {
  rewardsEnabled: boolean
  pointsPerReferral: number
  minimumReferralsForReward: number
  rewardAmount?: number
  codeExpiryDays?: number
  maxCodesPerUser?: number
}

export default function AdminReferralsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'COMPLETED'>('all')

  // --- QUERIES ---

  const { data: metrics, isLoading: metricsLoading } = useQuery<ReferralMetrics>({
    queryKey: ['admin-referral-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/referrals/metrics')
      return data.data
    }
  })

  const { data: referralsData, isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ['admin-referrals', statusFilter],
    queryFn: async () => {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`
      const { data } = await api.get(`/admin/referrals${query}`)
      return data.data
    }
  })

  const { data: topReferrers, isLoading: topReferrersLoading } = useQuery<TopReferrer[]>({
    queryKey: ['admin-top-referrers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/referrals/leaderboard')
      return data.data
    }
  })

  const { data: codesData, isLoading: codesLoading } = useQuery<ReferralCode[]>({
    queryKey: ['admin-referral-codes'],
    queryFn: async () => {
      const { data } = await api.get('/admin/referrals/codes')
      return data.data
    }
  })

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ['admin-referral-settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/referrals/settings')
      return data.data
    }
  })

  // --- MUTATIONS ---

  const toggleCodeStatus = useMutation({
    mutationFn: async ({ code, isActive }: { code: string; isActive: boolean }) => {
      await api.patch(`/admin/referrals/codes/${code}/toggle`, { isActive })
    },
    onSuccess: () => {
      toast.success('Code status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-referral-codes'] })
    },
    onError: () => toast.error('Failed to update code status')
  })

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<SystemSettings>) => {
      await api.patch('/admin/referrals/settings', newSettings)
    },
    onSuccess: () => {
      toast.success('Settings updated')
      queryClient.invalidateQueries({ queryKey: ['admin-referral-settings'] })
    },
    onError: () => toast.error('Failed to update settings')
  })

  const exportCsv = useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/admin/referrals/export/csv', { 
        responseType: 'blob'
      })
      return data
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `referrals-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Referrals exported successfully')
    },
    onError: () => toast.error('Failed to export referrals')
  })

  // --- COLUMNS ---

  const referralsColumns: ColumnDef<Referral>[] = [
    {
      accessorKey: 'referrer.firstName',
      header: 'Referrer',
      cell: ({ row }) => {
        const { firstName, lastName, email } = row.original.referrer
        return (
          <div className="flex flex-col">
            <span className="font-medium">{firstName} {lastName}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'referredUser.firstName',
      header: 'Referred User',
      cell: ({ row }) => {
        const { firstName, lastName, email } = row.original.referredUser
        return (
          <div className="flex flex-col">
            <span className="font-medium">{firstName} {lastName}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.getValue('createdAt') as string), 'MMM d, yyyy')
    }
  ]

  const codesColumns: ColumnDef<ReferralCode>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{row.getValue('code') as string}</span>
      )
    },
    {
      accessorKey: 'user.firstName',
      header: 'Owner',
      cell: ({ row }) => {
        const { firstName, lastName, email } = row.original.user
        return (
          <div className="flex flex-col">
            <span className="font-medium">{firstName} {lastName}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <Checkbox
            checked={isActive}
            onCheckedChange={(checked) => {
              toggleCodeStatus.mutate({
                code: row.original.code,
                isActive: checked as boolean
              })
            }}
          />
        )
      }
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral System</h1>
          <p className="text-muted-foreground">Manage referrals, codes, and system settings.</p>
        </div>
        <Button 
          onClick={() => exportCsv.mutate()}
          disabled={exportCsv.isPending}
          className="bg-gradient-brand shadow-lg border-0"
        >
          <Download className="mr-2 h-4 w-4" />
          {exportCsv.isPending ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* --- METRICS CARDS --- */}
      {metricsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalReferrals ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Gift className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.completedReferrals ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.pendingReferrals ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Unique Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.uniqueReferrers ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Code className="h-4 w-4" />
                Active Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeCodes ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Gift className="h-4 w-4" />
                Total Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.totalRewardsGiven ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- TABS --- */}
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="codes">Codes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* --- REFERRALS TAB --- */}
        <TabsContent value="referrals" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
            </div>
          </div>

          {referralsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DataTable 
              columns={referralsColumns} 
              data={referralsData || []}
            />
          )}
        </TabsContent>

        {/* --- LEADERBOARD TAB --- */}
        <TabsContent value="leaderboard" className="space-y-4">
          {topReferrersLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="space-y-4">
              {topReferrers?.map((referrer, idx) => (
                <Card key={referrer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl font-bold text-muted-foreground">#{idx + 1}</div>
                        <div>
                          <p className="font-semibold">{referrer.firstName} {referrer.lastName}</p>
                          <p className="text-sm text-muted-foreground">{referrer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{referrer.referralCount}</p>
                        <p className="text-sm text-muted-foreground">
                          {referrer.completedCount} completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- CODES TAB --- */}
        <TabsContent value="codes" className="space-y-4">
          {codesLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DataTable
              columns={codesColumns}
              data={codesData || []}
            />
          )}
        </TabsContent>

        {/* --- SETTINGS TAB --- */}
        <TabsContent value="settings" className="space-y-4">
          {settingsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure the referral reward system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rewards Enabled */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Enable Rewards</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to earn rewards from referrals
                    </p>
                  </div>
                  <Checkbox
                    checked={settings?.rewardsEnabled ?? false}
                    onCheckedChange={(checked) => {
                      updateSettings.mutate({ rewardsEnabled: checked as boolean })
                    }}
                  />
                </div>

                {/* Points Per Referral */}
                <div>
                  <Label htmlFor="points" className="text-base font-semibold">Points Per Referral</Label>
                  <Input
                    id="points"
                    type="number"
                    defaultValue={settings?.pointsPerReferral ?? 100}
                    onChange={(e) => {
                      updateSettings.mutate({
                        pointsPerReferral: parseInt(e.target.value) || 0
                      })
                    }}
                    className="mt-2 max-w-xs"
                  />
                </div>

                {/* Minimum Referrals For Reward */}
                <div>
                  <Label htmlFor="minReferrals" className="text-base font-semibold">
                    Minimum Referrals for Reward
                  </Label>
                  <Input
                    id="minReferrals"
                    type="number"
                    defaultValue={settings?.minimumReferralsForReward ?? 5}
                    onChange={(e) => {
                      updateSettings.mutate({
                        minimumReferralsForReward: parseInt(e.target.value) || 0
                      })
                    }}
                    className="mt-2 max-w-xs"
                  />
                </div>

                {/* Reward Amount */}
                {settings?.rewardAmount !== undefined && (
                  <div>
                    <Label htmlFor="rewardAmount" className="text-base font-semibold">Reward Amount ($)</Label>
                    <Input
                      id="rewardAmount"
                      type="number"
                      step="0.01"
                      defaultValue={settings?.rewardAmount ?? 0}
                      onChange={(e) => {
                        updateSettings.mutate({
                          rewardAmount: parseFloat(e.target.value) || 0
                        })
                      }}
                      className="mt-2 max-w-xs"
                    />
                  </div>
                )}

                {/* Code Expiry Days */}
                {settings?.codeExpiryDays !== undefined && (
                  <div>
                    <Label htmlFor="codeExpiry" className="text-base font-semibold">Code Expiry (Days)</Label>
                    <Input
                      id="codeExpiry"
                      type="number"
                      defaultValue={settings?.codeExpiryDays ?? 365}
                      onChange={(e) => {
                        updateSettings.mutate({
                          codeExpiryDays: parseInt(e.target.value) || 0
                        })
                      }}
                      className="mt-2 max-w-xs"
                    />
                  </div>
                )}

                {/* Max Codes Per User */}
                {settings?.maxCodesPerUser !== undefined && (
                  <div>
                    <Label htmlFor="maxCodes" className="text-base font-semibold">Max Codes Per User</Label>
                    <Input
                      id="maxCodes"
                      type="number"
                      defaultValue={settings?.maxCodesPerUser ?? 1}
                      onChange={(e) => {
                        updateSettings.mutate({
                          maxCodesPerUser: parseInt(e.target.value) || 0
                        })
                      }}
                      className="mt-2 max-w-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
