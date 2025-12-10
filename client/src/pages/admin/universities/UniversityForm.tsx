import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import ImageUpload from '@/components/common/ImageUpload'
import MicroContentManagerV2 from '@/components/admin/MicroContentManagerV2'

// Relaxed schema for the form (backend handles strict types)
const universitySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  websiteUrl: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  
  // Location
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  climateZone: z.string().optional(),
  setting: z.enum(['URBAN', 'SUBURBAN', 'RURAL']).optional(),

  // Stats
  acceptanceRate: z.number().min(0).max(1).optional(),
  minGpa: z.number().min(0).max(5).optional(),
  avgSatScore: z.number().min(400).max(1600).optional(),
  
  // Financials
  tuitionInState: z.number().optional(),
  tuitionOutState: z.number().optional(),
  tuitionInternational: z.number().optional(),
  roomAndBoard: z.number().optional(),
  costOfLiving: z.number().optional(),
  
  // Life & Future
  studentLifeScore: z.number().min(0).max(5).optional(),
  safetyRating: z.number().min(0).max(5).optional(),
  partySceneRating: z.number().min(0).max(5).optional(),
  visaDurationMonths: z.number().optional(),
})

export type UniversityFormValues = z.infer<typeof universitySchema>

type Props = {
  initialData?: Partial<UniversityFormValues>
  onSubmit: (values: UniversityFormValues) => Promise<void> | void
  universityId?: string // For micro-content tab
}

export default function UniversityForm({ initialData, onSubmit, universityId }: Props) {
  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: '',
      slug: '',
      country: 'USA',
      ...initialData,
    },
  })

  // Auto-generate slug
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'name' && values?.name && !form.getValues('slug') && !initialData?.slug) {
        const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        form.setValue('slug', slug)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, initialData])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className={`grid w-full ${universityId ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="basic">Overview</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="life">Campus Life</TabsTrigger>
          {universityId && <TabsTrigger value="micro-content">Micro-Content</TabsTrigger>}
        </TabsList>

        {/* --- 1. BASIC INFO --- */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">University Name</label>
                  <Input {...form.register('name')} placeholder="e.g. Stanford University" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <Input {...form.register('slug')} placeholder="stanford-university" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...form.register('description')} placeholder="A brief overview..." rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <Input {...form.register('websiteUrl')} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo</label>
                  <ImageUpload value={form.watch('logoUrl')} onChange={(url) => form.setValue('logoUrl', url)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Image</label>
                  <ImageUpload value={form.watch('heroImageUrl')} onChange={(url) => form.setValue('heroImageUrl', url)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. LOCATION --- */}
        <TabsContent value="location" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input {...form.register('city')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State / Province</label>
                <Input {...form.register('state')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input {...form.register('country')} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Climate Zone</label>
                <Select value={form.watch('climateZone')} onValueChange={(v) => form.setValue('climateZone', v)}>
                  <SelectTrigger><SelectValue placeholder="Select Climate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temperate">Temperate</SelectItem>
                    <SelectItem value="Tropical">Tropical</SelectItem>
                    <SelectItem value="Arid">Arid</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Campus Setting</label>
                <Select value={form.watch('setting')} onValueChange={(v: any) => form.setValue('setting', v)}>
                  <SelectTrigger><SelectValue placeholder="Select Setting" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URBAN">Urban</SelectItem>
                    <SelectItem value="SUBURBAN">Suburban</SelectItem>
                    <SelectItem value="RURAL">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 3. ACADEMIC --- */}
        <TabsContent value="academic" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-medium">Acceptance Rate (0-1)</label>
                <Input type="number" step="0.01" {...form.register('acceptanceRate', { valueAsNumber: true })} placeholder="0.05" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min GPA</label>
                <Input type="number" step="0.1" {...form.register('minGpa', { valueAsNumber: true })} placeholder="3.0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avg SAT</label>
                <Input type="number" {...form.register('avgSatScore', { valueAsNumber: true })} placeholder="1400" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 4. FINANCIAL --- */}
        <TabsContent value="financial" className="space-y-4 mt-4">
           <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tuition (In-State)</label>
                <Input type="number" {...form.register('tuitionInState', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tuition (Out-of-State)</label>
                <Input type="number" {...form.register('tuitionOutState', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tuition (International)</label>
                <Input type="number" {...form.register('tuitionInternational', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Room & Board</label>
                <Input type="number" {...form.register('roomAndBoard', { valueAsNumber: true })} />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium">Est. Cost of Living</label>
                <Input type="number" {...form.register('costOfLiving', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. LIFE & FUTURE --- */}
        <TabsContent value="life" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Life Score (0-5)</label>
                <Input type="number" step="0.1" {...form.register('studentLifeScore', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Safety Rating (0-5)</label>
                <Input type="number" step="0.1" {...form.register('safetyRating', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Party Scene (0-5)</label>
                <Input type="number" step="0.1" {...form.register('partySceneRating', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Post-Grad Visa (Months)</label>
                <Input type="number" {...form.register('visaDurationMonths', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 6. MICRO-CONTENT TAB --- */}
        {universityId && (
          <TabsContent value="micro-content" className="space-y-4 mt-4">
            <MicroContentManagerV2 universityId={universityId} />
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg" className="w-full sm:w-auto">Save University</Button>
      </div>
    </form>
  )
}
