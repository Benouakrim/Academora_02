import { useNavigate, useParams } from 'react-router-dom'
import UniversityForm from './UniversityForm'
import type { UniversityFormValues } from './UniversityForm'
import { useCreateUniversity, useUniversity, useUpdateUniversity } from '@/hooks/useAdminUniversities'

export default function UniversityEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { data: uni, isLoading } = useUniversity(id)
  const create = useCreateUniversity()
  const update = useUpdateUniversity()

  async function handleSubmit(values: UniversityFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, data: values })
      } else {
        await create.mutateAsync(values)
      }
      navigate('/admin/universities')
    } catch (e: any) {
      // Handle slug uniqueness conflict (409)
      const status = e?.response?.status
      const message = e?.response?.data?.message
      if (status === 409) {
        alert(message ?? 'Slug must be unique.')
      } else {
        alert('Failed to save university.')
      }
    }
  }

  const initialData = isEdit && uni ? {
    name: uni.name,
    slug: uni.slug,
    website: uni.website ?? '',
    city: uni.city ?? '',
    state: uni.state ?? '',
    country: uni.country,
    acceptanceRate: uni.acceptanceRate,
    minGpa: uni.minGpa,
    avgSat: uni.avgSat,
    tuitionInState: uni.tuitionInState,
    tuitionOutState: uni.tuitionOutState,
    costOfLiving: uni.costOfLiving,
  } : undefined

  if (isEdit && isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit University' : 'Add University'}</h2>
      </div>
      <UniversityForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  )
}
