import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { DollarSign, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface UniversityFinance {
  university?: { tuitionOutState?: number | null; tuitionInternational?: number | null; name: string }
}

export default function FinancialHealthBar() {
  const { profile } = useUserStore()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maxBudget = (profile as any)?.maxBudget || null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedUniversities = Array.isArray((profile as any)?.savedUniversities)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (profile as any).savedUniversities
    : []

  // Calculate average tuition of saved universities
  const avgTuition = (() => {
    if (savedUniversities.length === 0) return null
    const validTuitions = savedUniversities
      .map((su: UniversityFinance) => {
        const uni = su.university
        return uni?.tuitionOutState || uni?.tuitionInternational || 0
      })
      .filter((t: number) => t > 0)
    
    if (validTuitions.length === 0) return null
    return Math.round(validTuitions.reduce((a: number, b: number) => a + b, 0) / validTuitions.length)
  })()

  const isAffordable = maxBudget && avgTuition ? avgTuition <= maxBudget : null
  const difference = maxBudget && avgTuition ? Math.abs(maxBudget - avgTuition) : 0

  if (!maxBudget || !avgTuition) {
    return (
      <Card className="border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {!maxBudget && "Set your budget in your profile"}
            {maxBudget && !avgTuition && "Save universities to see financial insights"}
          </p>
          <Link to="/dashboard/profile" className="block">
            <Button size="sm" variant="default" className="w-full">
              Update Financial Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget vs Average Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Budget</span>
            <span className="font-semibold">${(maxBudget / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg. Cost of Saved Schools</span>
            <span className="font-semibold">${(avgTuition / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Budget vs. Average Cost</div>
          <div className="flex gap-2 h-8">
            {/* Budget bar */}
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ flex: maxBudget }}
            >
              {maxBudget > avgTuition * 2 && 'Budget'}
            </div>
            {/* Average cost bar */}
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold relative"
              style={{ flex: avgTuition }}
            >
              {avgTuition > maxBudget * 0.5 && 'Avg Cost'}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`rounded-lg p-3 flex items-start gap-2 ${
            isAffordable
              ? 'bg-green-100/50 dark:bg-green-950/30 border border-green-200 dark:border-green-900'
              : 'bg-amber-100/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900'
          }`}
        >
          <div className="flex-1">
            {isAffordable ? (
              <>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Great News!</p>
                <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                  Your saved universities are {difference > 0 ? 'within' : 'below'} your budget by ${(difference / 1000).toFixed(1)}k on average.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Budget Alert
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  Your saved universities exceed your budget by ${(difference / 1000).toFixed(1)}k on average. Consider exploring more affordable options.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link to="/compare">
          <Button size="sm" variant="outline" className="w-full">
            View Financial Comparison
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
