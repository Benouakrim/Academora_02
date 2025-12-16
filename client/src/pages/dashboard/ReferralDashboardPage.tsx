import { useReferrals } from '@/hooks/useReferrals'
import { Link } from 'react-router-dom'
import { Copy, Share2, Users, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function ReferralDashboardPage() {
  const { data, isLoading } = useReferrals()
  const { isAdmin } = useIsAdmin()
  
  // Assuming the client URL is available globally (VITE_CLIENT_URL)
  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'
  const referralLink = data?.referralCode ? `${clientUrl}/sign-up?ref=${data.referralCode}` : ''

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied to clipboard!')
    } else {
      toast.error('Clipboard access denied. Please copy manually.')
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  
  if (!data) return <div>Failed to load referral data.</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Referral Dashboard</h1>
          <p className="text-muted-foreground text-sm">Share AcademOra and earn rewards.</p>
        </div>
      </div>

      {/* --- Referral Link Card --- */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Your Unique Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex bg-muted rounded-lg border border-border overflow-hidden">
            <input 
              readOnly 
              value={referralLink}
              className="flex-1 px-4 py-3 text-sm font-mono bg-transparent border-none focus:outline-none truncate" 
            />
            <Button 
              type="button"
              variant="default"
              onClick={handleCopy}
              className="rounded-none h-auto px-4 py-3"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
             <Share2 className="w-3 h-3" /> Share this link with friends!
          </p>
        </CardContent>
      </Card>
      
      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for reward payouts.</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signups</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting profile completion.</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Referral List --- */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Referral History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {data.referrals.length > 0 ? (
              data.referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {ref.referred.firstName && ref.referred.lastName 
                        ? `${ref.referred.firstName} ${ref.referred.lastName}`
                        : ref.referred.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                       Joined {format(new Date(ref.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Badge variant={ref.status === 'COMPLETED' ? 'default' : ref.status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {ref.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                No referrals yet. Start sharing your link!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Pricing link - admin only for launch */}
      {isAdmin && (
        <div className="text-center pt-4">
          <Link to="/pricing">
            <Button variant="link" className="text-sm">
              Learn About Referral Rewards <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
