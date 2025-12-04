import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Users, TrendingUp, Plus } from 'lucide-react'
import { useFinancialProfile } from '@/hooks/useFinancialProfile'
import { useUpdateFinancialProfile, useInitializeFinancialProfile } from '@/hooks/useFinancialProfileMutations'
import type { FinancialProfileUpdateData } from '@/types/financialProfile'

// Financial Profile validation schema
const financialProfileSchema = z.object({
  maxBudget: z.number().min(0).max(500000).optional(),
  householdIncome: z.number().min(0).optional(),
  familySize: z.number().int().min(1).optional(),
  savings: z.number().min(0).optional(),
  investments: z.number().min(0).optional(),
  expectedFamilyContribution: z.number().min(0).optional(),
  eligibleForPellGrant: z.boolean().optional(),
  eligibleForStateAid: z.boolean().optional(),
})

type FormValues = z.infer<typeof financialProfileSchema>

export default function FinancialProfileTab() {
  const { data: profile, isLoading } = useFinancialProfile()
  const updateProfile = useUpdateFinancialProfile()
  const initializeProfile = useInitializeFinancialProfile()

  const form = useForm<FormValues>({
    resolver: zodResolver(financialProfileSchema),
    values: {
      maxBudget: profile?.maxBudget || 50000,
      householdIncome: profile?.householdIncome || undefined,
      familySize: profile?.familySize || undefined,
      savings: profile?.savings || undefined,
      investments: profile?.investments || undefined,
      expectedFamilyContribution: profile?.expectedFamilyContribution || undefined,
      eligibleForPellGrant: profile?.eligibleForPellGrant || false,
      eligibleForStateAid: profile?.eligibleForStateAid || false,
    },
  })

  const handleSubmit = (data: FormValues) => {
    const updates: FinancialProfileUpdateData = data
    updateProfile.mutate(updates)
  }

  const handleInitialize = () => {
    initializeProfile.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Profile Not Found
          </CardTitle>
          <CardDescription>
            Create your financial profile to get accurate cost estimates and financial aid recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleInitialize} 
            disabled={initializeProfile.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {initializeProfile.isPending ? 'Creating...' : 'Create Financial Profile'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const maxBudget = form.watch('maxBudget')

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Core Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Annual Budget
          </CardTitle>
          <CardDescription>
            What is your annual budget for tuition and expenses?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxBudget">Maximum Budget</Label>
              <span className="text-sm font-medium">${maxBudget?.toLocaleString() || 0}</span>
            </div>
            <Slider
              id="maxBudget"
              min={0}
              max={100000}
              step={5000}
              value={[maxBudget || 50000]}
              onValueChange={([value]) => form.setValue('maxBudget', value, { shouldDirty: true })}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              This helps us find universities within your budget
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Household Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Household Information
          </CardTitle>
          <CardDescription>
            Information used for financial aid calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="householdIncome">Household Income (Annual)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="householdIncome"
                  type="number"
                  step="1000"
                  placeholder="75000"
                  className="pl-7"
                  {...form.register('householdIncome', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="familySize">Family Size</Label>
              <Input
                id="familySize"
                type="number"
                min="1"
                placeholder="4"
                {...form.register('familySize', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Assets & Savings
          </CardTitle>
          <CardDescription>
            Optional: Helps calculate Expected Family Contribution (EFC)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="savings">Savings</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="savings"
                  type="number"
                  step="1000"
                  placeholder="10000"
                  className="pl-7"
                  {...form.register('savings', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investments">Investments</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="investments"
                  type="number"
                  step="1000"
                  placeholder="5000"
                  className="pl-7"
                  {...form.register('investments', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedFamilyContribution">Expected Family Contribution (EFC)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="expectedFamilyContribution"
                type="number"
                step="100"
                placeholder="15000"
                className="pl-7"
                {...form.register('expectedFamilyContribution', { valueAsNumber: true })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Calculate your EFC using the FAFSA4caster tool
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aid Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Aid Eligibility</CardTitle>
          <CardDescription>
            Check all that apply to your situation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="eligibleForPellGrant"
              checked={form.watch('eligibleForPellGrant')}
              onCheckedChange={(checked) =>
                form.setValue('eligibleForPellGrant', checked as boolean, { shouldDirty: true })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="eligibleForPellGrant" className="font-medium cursor-pointer">
                Eligible for Pell Grant
              </Label>
              <p className="text-sm text-muted-foreground">
                Federal grant for undergraduate students with exceptional financial need
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="eligibleForStateAid"
              checked={form.watch('eligibleForStateAid')}
              onCheckedChange={(checked) =>
                form.setValue('eligibleForStateAid', checked as boolean, { shouldDirty: true })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="eligibleForStateAid" className="font-medium cursor-pointer">
                Eligible for State Aid
              </Label>
              <p className="text-sm text-muted-foreground">
                State-specific financial aid programs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={updateProfile.isPending || !form.formState.isDirty}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
