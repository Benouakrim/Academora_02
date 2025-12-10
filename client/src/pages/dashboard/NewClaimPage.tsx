import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Building2, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UniversityAutocomplete } from '@/components/claims/UniversityAutocomplete';
import { FileUpload } from '@/components/claims/FileUpload';
import { useCreateClaim } from '@/hooks/useClaims';

// Claim types
const CLAIM_TYPES = [
  { value: 'OWNERSHIP', label: 'Full Ownership', description: 'Request full control of the university profile' },
  { value: 'VERIFICATION', label: 'Verification Only', description: 'Verify your affiliation without ownership' },
  { value: 'CONTRIBUTOR', label: 'Contributor Access', description: 'Request permission to edit content' },
  { value: 'DATA_CORRECTION', label: 'Data Correction', description: 'Submit corrections to existing information' },
] as const;

// Position options
const POSITION_OPTIONS = [
  'President', 'Vice President', 'Dean', 'Associate Dean',
  'Director of Admissions', 'Admissions Officer', 'Registrar',
  'Director of Communications', 'Marketing Director',
  'Public Relations Officer', 'Faculty Member', 'Department Head', 'Other',
] as const;

// Form Schema
const claimSchema = z.object({
  claimType: z.enum(['OWNERSHIP', 'VERIFICATION', 'CONTRIBUTOR', 'DATA_CORRECTION']),
  entityType: z.enum(['university', 'group']),
  universityId: z.string().uuid().optional(),
  universityName: z.string().optional(),
  universityGroupId: z.string().uuid().optional(),
  requesterName: z.string().min(2, 'Full name is required'),
  requesterEmail: z.string().email('Valid email required'),
  institutionalEmail: z.string().email('Valid institutional email required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().optional(),
  comments: z.string().max(1000).optional(),
  verificationDocument1: z.string().url('Document is required'),
  verificationDocument2: z.string().url().optional(),
  verificationDocument3: z.string().url().optional(),
}).refine(
  (data) => {
    if (data.entityType === 'university') return !!data.universityId;
    if (data.entityType === 'group') return !!data.universityGroupId;
    return false;
  },
  { message: 'Please select a university or group', path: ['universityId'] }
);

type ClaimFormValues = z.infer<typeof claimSchema>;

export default function NewClaimPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const createClaimMutation = useCreateClaim();

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      claimType: 'OWNERSHIP',
      entityType: 'university',
      requesterName: '',
      requesterEmail: '',
      institutionalEmail: '',
      position: '',
      department: '',
      comments: '',
    },
    mode: 'onBlur',
  });

  const currentValues = form.watch();
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const onSubmit = async (values: ClaimFormValues) => {
    const verificationDocuments = [
      values.verificationDocument1,
      values.verificationDocument2,
      values.verificationDocument3,
    ].filter((url): url is string => !!url);

    try {
      await createClaimMutation.mutateAsync({
        universityId: values.entityType === 'university' ? values.universityId : undefined,
        universityGroupId: values.entityType === 'group' ? values.universityGroupId : undefined,
        claimType: values.claimType as any,
        requesterName: values.requesterName,
        requesterEmail: values.requesterEmail,
        institutionalEmail: values.institutionalEmail,
        position: values.position,
        department: values.department,
        verificationDocuments,
        comments: values.comments,
      });
      navigate('/dashboard/claims');
    } catch {
      // Error handled by mutation
    }
  };

  const validateStep = async (currentStep: number): Promise<boolean> => {
    let fields: (keyof ClaimFormValues)[] = [];
    switch (currentStep) {
      case 1: fields = ['claimType']; break;
      case 2: fields = ['entityType', 'universityId', 'universityGroupId']; break;
      case 3: fields = ['requesterName', 'requesterEmail', 'institutionalEmail', 'position']; break;
      case 4: fields = ['verificationDocument1']; break;
      case 5: return true;
    }
    return await form.trigger(fields);
  };

  const nextStep = async () => {
    if (await validateStep(step) && step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/claims')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claims
        </Button>
        <h1 className="text-3xl font-bold mb-2">Request University Ownership</h1>
        <p className="text-muted-foreground">Verify your affiliation with a university to manage their profile</p>
        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Selected University Banner */}
        {currentValues.universityName && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Claiming ownership for:</p>
                  <p className="text-lg font-bold text-primary">{currentValues.universityName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Claim Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Claim Type</CardTitle>
              <CardDescription>Choose the type of access you're requesting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="claimType"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    {CLAIM_TYPES.map((type) => (
                      <div key={type.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value} className="cursor-pointer flex-1">
                          <p className="font-medium">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select University */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Entity</CardTitle>
              <CardDescription>Choose the institution you're claiming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="entityType"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="university" id="university" />
                      <Label htmlFor="university" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Single University</p>
                          <p className="text-sm text-muted-foreground">Claim one specific institution</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="group" id="group" />
                      <Label htmlFor="group" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Users className="h-5 w-5" />
                        <div>
                          <p className="font-medium">University Group</p>
                          <p className="text-sm text-muted-foreground">Claim a group of institutions</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />

              {currentValues.entityType === 'university' && (
                <Controller
                  name="universityId"
                  control={form.control}
                  render={({ field }) => (
                    <UniversityAutocomplete
                      value={field.value}
                      universityName={currentValues.universityName}
                      onChange={(id, name) => {
                        field.onChange(id);
                        form.setValue('universityName', name);
                      }}
                      error={form.formState.errors.universityId?.message}
                    />
                  )}
                />
              )}

              {currentValues.entityType === 'group' && (
                <div className="space-y-2">
                  <Label htmlFor="universityGroupId">Select University Group</Label>
                  <Controller
                    name="universityGroupId"
                    control={form.control}
                    render={({ field }) => <Input {...field} id="universityGroupId" placeholder="Enter group UUID" />}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Personal Information */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Provide your official details as they appear in institutional records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requesterName">Full Name *</Label>
                <Controller
                  name="requesterName"
                  control={form.control}
                  render={({ field }) => <Input {...field} id="requesterName" placeholder="John Doe" />}
                />
                {form.formState.errors.requesterName && (
                  <p className="text-sm text-destructive">{form.formState.errors.requesterName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requesterEmail">Your Email *</Label>
                <Controller
                  name="requesterEmail"
                  control={form.control}
                  render={({ field }) => <Input {...field} id="requesterEmail" type="email" placeholder="john.doe@email.com" />}
                />
                {form.formState.errors.requesterEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.requesterEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionalEmail">Institutional Email *</Label>
                <Controller
                  name="institutionalEmail"
                  control={form.control}
                  render={({ field }) => <Input {...field} id="institutionalEmail" type="email" placeholder="john.doe@university.edu" />}
                />
                {form.formState.errors.institutionalEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.institutionalEmail.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Must be your official university email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position/Title *</Label>
                <Controller
                  name="position"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_OPTIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Controller
                  name="department"
                  control={form.control}
                  render={({ field }) => <Input {...field} id="department" placeholder="e.g., Office of Admissions" />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Upload Documents */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>Upload official documents proving your affiliation (images or PDFs accepted)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document 1 *</Label>
                <Controller
                  name="verificationDocument1"
                  control={form.control}
                  render={({ field }) => (
                    <FileUpload value={field.value} onChange={field.onChange} />
                  )}
                />
                {form.formState.errors.verificationDocument1 && (
                  <p className="text-sm text-destructive">{form.formState.errors.verificationDocument1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Document 2 (Optional)</Label>
                <Controller
                  name="verificationDocument2"
                  control={form.control}
                  render={({ field }) => (
                    <FileUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Document 3 (Optional)</Label>
                <Controller
                  name="verificationDocument3"
                  control={form.control}
                  render={({ field }) => (
                    <FileUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Claim</CardTitle>
              <CardDescription>Please verify all information is correct before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Claim Type</h3>
                <p className="text-sm text-muted-foreground">
                  {CLAIM_TYPES.find(t => t.value === currentValues.claimType)?.label}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Entity</h3>
                <p className="text-sm text-muted-foreground">{currentValues.universityName || 'Group'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {currentValues.requesterName}</p>
                  <p><strong>Email:</strong> {currentValues.requesterEmail}</p>
                  <p><strong>Institutional Email:</strong> {currentValues.institutionalEmail}</p>
                  <p><strong>Position:</strong> {currentValues.position}</p>
                  {currentValues.department && <p><strong>Department:</strong> {currentValues.department}</p>}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Verification Documents</h3>
                <p className="text-sm text-muted-foreground">
                  {[currentValues.verificationDocument1, currentValues.verificationDocument2, currentValues.verificationDocument3].filter(Boolean).length} document(s) uploaded
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments (Optional)</Label>
                <Controller
                  name="comments"
                  control={form.control}
                  render={({ field }) => <Textarea {...field} id="comments" placeholder="Add any additional information..." rows={4} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {step < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={createClaimMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {createClaimMutation.isPending ? 'Processing...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Claim
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
