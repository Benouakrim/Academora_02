import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Check, Upload, User, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '@/components/common/ImageUpload'
import { useCreateClaim } from '@/hooks/useClaims'
import { toast } from 'sonner'

// --- 1. Form Schema (Zod) ---
const claimSchema = z.object({
  universityId: z.string().uuid().optional(),
  universityGroupId: z.string().uuid().optional(),
  
  // Step 2
  requesterName: z.string().min(2, 'Full name is required'),
  requesterEmail: z.string().email('Must be a valid institutional email'),
  position: z.string().min(2, 'Your official position is required'),
  department: z.string().optional(),
  comments: z.string().max(500).optional(),

  // Step 3
  verificationDocument1: z.string().url('A document URL is required'),
  verificationDocument2: z.string().url().optional(),
})
.refine(data => data.universityId || data.universityGroupId, {
    message: 'Either a University or a University Group must be selected.',
    path: ['universityId'],
})

type ClaimFormValues = z.infer<typeof claimSchema>

type ClaimRequestPayload = {
  universityId?: string
  universityGroupId?: string
  requesterName: string
  requesterEmail: string
  position: string
  department?: string
  verificationDocuments: string[]
  comments?: string
}

// --- 2. Main Component ---

export default function UniversityClaimPage() {
  const { id: paramId } = useParams<{ id: string }>() // Assume ID/slug could be passed here, use constant for mock data
  const [step, setStep] = useState(1)
  const { mutate, isPending } = useCreateClaim()
  
  // Mock data for initial rendering context
  const mockUniversityId = 'd0c9f13c-74a9-4089-8d76-50d43715c0e2'
  const mockUniversityName = 'Massachusetts Institute of Technology (MIT)'

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      universityId: mockUniversityId, // Default to MIT for demo
      requesterEmail: '',
    },
    mode: 'onBlur',
  })

  const currentValues = form.watch()
  
  const onSubmit = (values: ClaimFormValues) => {
    // Collect all uploaded document URLs
    const verificationDocuments: string[] = [values.verificationDocument1, values.verificationDocument2]
      .filter((url): url is string => !!url)
    
    // Prepare payload for backend
    const payload: ClaimRequestPayload = {
      universityId: values.universityId,
      universityGroupId: values.universityGroupId,
      requesterName: values.requesterName,
      requesterEmail: values.requesterEmail,
      position: values.position,
      department: values.department,
      comments: values.comments,
      verificationDocuments,
    }

    if (verificationDocuments.length === 0) {
        toast.error("Please upload at least one verification document.");
        setStep(3);
        return;
    }

    mutate(payload)
  }

  // Helper function to check if current step is valid before advancing
  const canAdvance = async () => {
    if (step === 1) {
        if (!currentValues.universityId && !currentValues.universityGroupId) {
            toast.error('Please select a university or group to claim.');
            return false;
        }
    }
    if (step === 2) {
        const isValid = await form.trigger(['requesterName', 'requesterEmail', 'position']);
        if (!isValid) {
            toast.error('Please fill in all required contact details correctly.');
            return false;
        }
    }
    return true;
  };

  const handleNext = async () => {
    if (await canAdvance()) {
      setStep(step + 1)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to={`/university/${mockUniversityId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
      </Link>
      
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Claim University Profile</CardTitle>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-sm">
                <Landmark className="h-4 w-4 text-primary" />
                <span className="font-semibold">{mockUniversityName}</span>
            </div>
            <div className="text-sm text-muted-foreground">Step {step} of 3</div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* --- STEP 1: Selection (Mocked) --- */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Check className="h-4 w-4" /> Select Entity</h3>
                <p className="text-muted-foreground">You are attempting to claim ownership of the profile for: <strong>{mockUniversityName}</strong>.</p>
                <Controller
                    name="universityId"
                    control={form.control}
                    render={({ field }) => (
                        <input type="hidden" {...field} />
                    )}
                />
              </div>
            )}

            {/* --- STEP 2: Contact Details --- */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Your Details</h3>
                <p className="text-muted-foreground">Provide your professional contact details for verification. This must match the institutional domain.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input {...form.register('requesterName')} placeholder="Jane Smith" />
                    {form.formState.errors.requesterName && <p className="text-xs text-destructive">{form.formState.errors.requesterName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Institutional Email</label>
                    <Input {...form.register('requesterEmail')} placeholder="jane.smith@mit.edu" />
                    {form.formState.errors.requesterEmail && <p className="text-xs text-destructive">{form.formState.errors.requesterEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position/Title</label>
                    <Input {...form.register('position')} placeholder="Admissions Coordinator" />
                    {form.formState.errors.position && <p className="text-xs text-destructive">{form.formState.errors.position.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department (Optional)</label>
                    <Input {...form.register('department')} placeholder="Office of Undergraduate Admissions" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments (Optional)</label>
                  <Textarea {...form.register('comments')} placeholder="Briefly explain why you are claiming this profile..." rows={3} />
                </div>
              </div>
            )}

            {/* --- STEP 3: Documents --- */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Upload className="h-4 w-4" /> Verification Documents</h3>
                <p className="text-muted-foreground">Upload official documents (e.g., business card, staff directory screenshot, letterhead) confirming your position. <strong>One document is required.</strong></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Document 1 (Required)</label>
                        <Controller
                            name="verificationDocument1"
                            control={form.control}
                            render={({ field }) => (
                                <ImageUpload value={field.value} onChange={field.onChange} />
                            )}
                        />
                        {form.formState.errors.verificationDocument1 && <p className="text-xs text-destructive">{form.formState.errors.verificationDocument1.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Document 2 (Optional)</label>
                        <Controller
                            name="verificationDocument2"
                            control={form.control}
                            render={({ field }) => (
                                <ImageUpload value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" size="lg" disabled={isPending || form.getValues('verificationDocument1') === ''} className="w-full">
                    {isPending ? 'Submitting...' : 'Submit Claim Request'}
                </Button>
                {form.formState.errors.root && <p className="text-xs text-destructive mt-2">{form.formState.errors.root.message}</p>}
              </div>
            )}
            
            {/* --- Navigation Footer --- */}
            <div className="flex justify-between border-t pt-4">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                        Previous
                    </Button>
                ) : <div />}
                
                {step < 3 && (
                    <Button type="button" onClick={handleNext} disabled={isPending}>
                        Next Step
                    </Button>
                )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
