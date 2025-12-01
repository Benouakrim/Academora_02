import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useUserStore } from '@/store/useUserStore'

type Props = {
  initialData?: Record<string, any> | null
}

export default function ProfileForm({ initialData }: Props) {
  const { fetchProfile } = useUserStore()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gpa: initialData?.gpa ?? undefined,
      satScore: initialData?.satScore ?? undefined,
      actScore: initialData?.actScore ?? undefined,
      familyIncome: initialData?.familyIncome ?? undefined,
      interestedInAid: initialData?.interestedInAid ?? false,
      maxBudget: initialData?.maxBudget ?? 50000,
      preferredMajor: initialData?.preferredMajor ?? '',
      preferredCountry: initialData?.preferredCountry ?? '',
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    const payload = {
      ...values,
    }
    await api.patch('/user/profile', payload)
    toast.success('Profile saved')
    await fetchProfile()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="academics">
        <TabsList>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
        </TabsList>

        <TabsContent value="academics" className="space-y-4">
          <div>
            <label className="text-sm font-medium">GPA</label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g., 3.75"
              {...form.register('gpa', { valueAsNumber: true })}
            />
            {form.formState.errors.gpa && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.gpa.message as string}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">SAT</label>
              <Input type="number" placeholder="e.g., 1420" {...form.register('satScore', { valueAsNumber: true })} />
              {form.formState.errors.satScore && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.satScore.message as string}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">ACT</label>
              <Input type="number" placeholder="e.g., 32" {...form.register('actScore', { valueAsNumber: true })} />
              {form.formState.errors.actScore && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.actScore.message as string}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Family Income (USD)</label>
            <Input type="number" placeholder="e.g., 60000" {...form.register('familyIncome', { valueAsNumber: true })} />
            {form.formState.errors.familyIncome && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.familyIncome.message as string}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Max Budget</label>
            <div className="pt-2">
              <Slider
                min={0}
                max={100000}
                step={1000}
                value={[form.watch('maxBudget') || 0]}
                onValueChange={(v) => form.setValue('maxBudget', v[0])}
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">${((form.watch('maxBudget') || 0) / 1000).toFixed(0)}k / year</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...form.register('interestedInAid')} id="aid" />
            <label htmlFor="aid" className="text-sm">I am interested in financial aid</label>
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Preferred Major</label>
            <Input placeholder="e.g., Computer Science" {...form.register('preferredMajor')} />
            {form.formState.errors.preferredMajor && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.preferredMajor.message as string}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Preferred Country</label>
            <Select value={form.watch('preferredCountry') || ''} onValueChange={(v) => form.setValue('preferredCountry', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {['', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands'].map((c) => (
                  <SelectItem key={c} value={c}>{c || 'Any'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}
