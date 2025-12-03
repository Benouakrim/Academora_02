import { useTranslation } from 'react-i18next'
import { Check, X, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCheckoutSubscription } from '@/hooks/useBilling' // Hook from this prompt

// --- Feature data structure (Use i18n keys for display) ---
const featureList = [
  { key: 'feature_basic_search', free: true, premium: true },
  { key: 'feature_save_comparison', free: true, premium: true },
  { key: 'feature_financial_aid', free: true, premium: true },
  { key: 'feature_matching_engine', free: false, premium: true, highlight: true },
  { key: 'feature_unlimited_reviews', free: false, premium: true },
  { key: 'feature_advanced_filters', free: false, premium: true },
  { key: 'feature_priority_support', free: false, premium: true },
  { key: 'feature_ad_free', free: false, premium: true },
]

// --- Pricing Page Component ---
export default function PricingPage() {
  const { t } = useTranslation()
  const { mutate: startCheckout, isPending } = useCheckoutSubscription()
  
  // NOTE: You would normally fetch price details from your backend or a CMS
  const priceData = {
    monthly: 9.99,
    yearly: 99.99,
  }

  const FeatureItem: React.FC<{ featureKey: string; included: boolean; highlight?: boolean }> = ({ featureKey, included, highlight }) => (
    <li className="flex items-center space-x-3 text-sm">
      {included ? (
        <Check className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      )}
      <span className={highlight ? 'font-semibold text-primary' : (included ? 'text-foreground' : 'text-muted-foreground')}>
        {t(featureKey)}
      </span>
    </li>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pricing_header_title')}</h1>
        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">{t('pricing_header_subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* --- FREE TIER CARD --- */}
        <Card className="shadow-lg border-2 border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold">{t('tier_free_title')}</CardTitle>
            <CardDescription className="mt-1">{t('tier_free_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="text-xl font-medium text-muted-foreground">/ {t('tier_free_period')}</span>
            </div>
            
            <ul role="list" className="space-y-3">
              {featureList.map(f => (
                <FeatureItem key={f.key} featureKey={f.key} included={f.free} />
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button variant="outline" className="w-full text-lg h-12" disabled>
              {t('button_current_plan')}
            </Button>
          </CardFooter>
        </Card>

        {/* --- PREMIUM TIER CARD --- */}
        <Card className="shadow-2xl border-4 border-primary ring-2 ring-primary/50">
          <CardHeader className="text-center pb-4 relative">
            <Badge className="absolute top-[-15px] left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold uppercase">{t('tier_premium_badge')}</Badge>
            <CardTitle className="text-3xl font-bold text-primary pt-3">{t('tier_premium_title')}</CardTitle>
            <CardDescription className="mt-1">{t('tier_premium_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-5xl font-extrabold">${priceData.monthly.toFixed(2)}</span>
              <span className="text-xl font-medium text-muted-foreground">/ {t('tier_premium_period')}</span>
            </div>
            
            <ul role="list" className="space-y-3">
              {featureList.map(f => (
                <FeatureItem key={f.key} featureKey={f.key} included={f.premium} highlight={f.highlight} />
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button 
              className="w-full text-lg h-12 bg-gradient-brand shadow-lg shadow-primary/30"
              onClick={() => startCheckout()}
              disabled={isPending}
            >
              {isPending ? t('button_redirecting') : <><DollarSign className="w-5 h-5 mr-2" /> {t('button_go_premium')}</>}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-10">
        {t('pricing_footer_note')}
      </p>
    </div>
  )
}
