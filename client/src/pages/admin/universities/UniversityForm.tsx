import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const universitySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().min(2, 'Country is required'),
  acceptanceRate: z.number().optional(),
  minGpa: z.number().min(0).max(4).optional(),
  avgSat: z.number().optional(),
  tuitionInState: z.number().optional(),
  tuitionOutState: z.number().optional(),
  costOfLiving: z.number().optional(),
})

export type UniversityFormValues = z.infer<typeof universitySchema>

type Props = {
  initialData?: Partial<UniversityFormValues>
  onSubmit: (values: UniversityFormValues) => Promise<void> | void
}

export default function UniversityForm({ initialData, onSubmit }: Props) {
  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: '',
      slug: '',
      website: '',
      city: '',
      state: '',
      country: 'United States',
      acceptanceRate: undefined,
      minGpa: undefined,
      avgSat: undefined,
      tuitionInState: undefined,
      tuitionOutState: undefined,
      costOfLiving: undefined,
      ...initialData,
    },
  })

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'name' && values?.name && !form.getValues('slug')) {
        const slug = values.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
        form.setValue('slug', slug, { shouldValidate: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Basic Info</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Name</label>
            <Input {...form.register('name')} placeholder="University Name" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Slug</label>
            <Input {...form.register('slug')} placeholder="unique-slug" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Website</label>
            <Input {...form.register('website')} placeholder="https://example.edu" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Location</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-600">City</label>
            <Input {...form.register('city')} placeholder="City" />
          </div>
          <div>
            <label className="text-sm text-slate-600">State</label>
            <Input {...form.register('state')} placeholder="State" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Country</label>
            <Input {...form.register('country')} placeholder="Country" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Admissions</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-600">Acceptance Rate (%)</label>
            <Input type="number" step="0.1" {...form.register('acceptanceRate', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Min GPA</label>
            <Input type="number" step="0.1" {...form.register('minGpa', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Avg SAT</label>
            <Input type="number" {...form.register('avgSat', { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Financials</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-600">Tuition (In-State)</label>
            <Input type="number" {...form.register('tuitionInState', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Tuition (Out-of-State)</label>
            <Input type="number" {...form.register('tuitionOutState', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Cost of Living</label>
            <Input type="number" {...form.register('costOfLiving', { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
