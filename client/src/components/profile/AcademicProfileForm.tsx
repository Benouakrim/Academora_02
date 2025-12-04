import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Plus, X, Trophy, GraduationCap, Award, BookOpen, Trash2 } from 'lucide-react'
import { useUpdateAcademicProfile, useDeleteAcademicProfile } from '@/hooks/useAcademicProfileMutations'
import type { AcademicProfile, AcademicProfileUpdateData } from '@/types/academicProfile'

// Extended form validation schema
const academicProfileFormSchema = z.object({
  // Core Academic Metrics
  gpa: z.number().min(0).max(100).optional(),
  gpaScale: z.number().int().positive().optional(),
  
  // High School Info
  highSchoolName: z.string().min(1).max(255).optional(),
  gradYear: z.number().int().min(1900).max(2100).optional(),
  
  // Intended Majors
  primaryMajor: z.string().min(1).max(255).optional(),
  secondaryMajor: z.string().min(1).max(255).optional(),
  
  // Extracurriculars
  extracurriculars: z.array(z.string()).optional(),
  
  // Test Scores
  satTotal: z.number().int().min(400).max(1600).optional(),
  satMath: z.number().int().min(200).max(800).optional(),
  satVerbal: z.number().int().min(200).max(800).optional(),
  actComposite: z.number().int().min(1).max(36).optional(),
  actEnglish: z.number().int().min(1).max(36).optional(),
  actMath: z.number().int().min(1).max(36).optional(),
  actReading: z.number().int().min(1).max(36).optional(),
  actScience: z.number().int().min(1).max(36).optional(),
  
  // AP Exams
  apExams: z.array(z.object({
    subject: z.string().min(1),
    score: z.number().int().min(1).max(5),
    year: z.number().int().min(2000).max(2100),
  })).optional(),
  
  // Academic Honors
  academicHonors: z.array(z.object({
    name: z.string().min(1),
    year: z.number().int().min(1900).max(2100),
    level: z.enum(['School', 'District', 'Regional', 'State', 'National', 'International']).optional(),
    description: z.string().optional(),
  })).optional(),
})

type FormValues = z.infer<typeof academicProfileFormSchema>

type Props = {
  profile: AcademicProfile
  onDeleted?: () => void
}

export default function AcademicProfileForm({ profile, onDeleted }: Props) {
  const updateProfile = useUpdateAcademicProfile()
  const deleteProfile = useDeleteAcademicProfile()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newActivity, setNewActivity] = useState('')

  // Parse existing test scores from JSON
  const existingTestScores = profile.testScores || {}
  
  const form = useForm<FormValues>({
    resolver: zodResolver(academicProfileFormSchema),
    defaultValues: {
      gpa: profile.gpa || undefined,
      gpaScale: profile.gpaScale || 4,
      highSchoolName: profile.highSchoolName || '',
      gradYear: profile.gradYear || undefined,
      primaryMajor: profile.primaryMajor || '',
      secondaryMajor: profile.secondaryMajor || '',
      extracurriculars: profile.extracurriculars || [],
      satTotal: existingTestScores.SAT?.total || undefined,
      satMath: existingTestScores.SAT?.math || undefined,
      satVerbal: existingTestScores.SAT?.verbal || undefined,
      actComposite: existingTestScores.ACT?.composite || undefined,
      actEnglish: existingTestScores.ACT?.english || undefined,
      actMath: existingTestScores.ACT?.math || undefined,
      actReading: existingTestScores.ACT?.reading || undefined,
      actScience: existingTestScores.ACT?.science || undefined,
      apExams: existingTestScores.AP || [],
      academicHonors: profile.academicHonors || [],
    },
  })

  // Field arrays for dynamic lists
  const { fields: apFields, append: appendAP, remove: removeAP } = useFieldArray({
    control: form.control,
    name: 'apExams',
  })

  const { fields: honorFields, append: appendHonor, remove: removeHonor } = useFieldArray({
    control: form.control,
    name: 'academicHonors',
  })

  const extracurriculars = form.watch('extracurriculars') || []

  const handleSubmit = (data: FormValues) => {
    // Construct testScores JSON
    const testScores: AcademicProfileUpdateData['testScores'] = {}
    
    if (data.satTotal || data.satMath || data.satVerbal) {
      testScores.SAT = {
        total: data.satTotal,
        math: data.satMath,
        verbal: data.satVerbal,
        date: new Date().toISOString(),
      }
    }
    
    if (data.actComposite || data.actEnglish || data.actMath || data.actReading || data.actScience) {
      testScores.ACT = {
        composite: data.actComposite,
        english: data.actEnglish,
        math: data.actMath,
        reading: data.actReading,
        science: data.actScience,
        date: new Date().toISOString(),
      }
    }
    
    if (data.apExams && data.apExams.length > 0) {
      testScores.AP = data.apExams
    }

    const updates: AcademicProfileUpdateData = {
      gpa: data.gpa,
      gpaScale: data.gpaScale,
      highSchoolName: data.highSchoolName,
      gradYear: data.gradYear,
      primaryMajor: data.primaryMajor,
      secondaryMajor: data.secondaryMajor,
      extracurriculars: data.extracurriculars,
      testScores: Object.keys(testScores).length > 0 ? testScores : undefined,
      academicHonors: data.academicHonors,
    }

    updateProfile.mutate(updates)
  }

  const handleDelete = () => {
    deleteProfile.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false)
        onDeleted?.()
      },
    })
  }

  const handleAddActivity = () => {
    if (newActivity.trim() && !extracurriculars.includes(newActivity.trim())) {
      form.setValue('extracurriculars', [...extracurriculars, newActivity.trim()], { shouldDirty: true })
      setNewActivity('')
    }
  }

  const handleRemoveActivity = (activity: string) => {
    form.setValue(
      'extracurriculars',
      extracurriculars.filter(a => a !== activity),
      { shouldDirty: true }
    )
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Academic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Academic Performance
            </CardTitle>
            <CardDescription>
              Your GPA and grading scale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  placeholder="3.85"
                  {...form.register('gpa', { valueAsNumber: true })}
                />
                {form.formState.errors.gpa && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {form.formState.errors.gpa.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpaScale">GPA Scale</Label>
                <Select
                  value={form.watch('gpaScale')?.toString()}
                  onValueChange={(value) => form.setValue('gpaScale', parseInt(value), { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4.0 Scale</SelectItem>
                    <SelectItem value="5">5.0 Scale (Weighted)</SelectItem>
                    <SelectItem value="10">10.0 Scale</SelectItem>
                    <SelectItem value="100">100 Point Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              High School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highSchoolName">High School Name</Label>
                <Input
                  id="highSchoolName"
                  placeholder="Lincoln High School"
                  {...form.register('highSchoolName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradYear">Graduation Year</Label>
                <Input
                  id="gradYear"
                  type="number"
                  placeholder="2025"
                  {...form.register('gradYear', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intended Majors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Intended Majors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryMajor">Primary Major</Label>
              <Input
                id="primaryMajor"
                placeholder="Computer Science"
                {...form.register('primaryMajor')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryMajor">Secondary Major (Optional)</Label>
              <Input
                id="secondaryMajor"
                placeholder="Mathematics"
                {...form.register('secondaryMajor')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Scores with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Standardized Test Scores
            </CardTitle>
            <CardDescription>
              Add your SAT, ACT, and AP exam scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sat" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sat">SAT</TabsTrigger>
                <TabsTrigger value="act">ACT</TabsTrigger>
                <TabsTrigger value="ap">AP Exams</TabsTrigger>
              </TabsList>

              {/* SAT Scores */}
              <TabsContent value="sat" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="satTotal">Total Score</Label>
                    <Input
                      id="satTotal"
                      type="number"
                      placeholder="1450"
                      {...form.register('satTotal', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satMath">Math</Label>
                    <Input
                      id="satMath"
                      type="number"
                      placeholder="750"
                      {...form.register('satMath', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satVerbal">Verbal</Label>
                    <Input
                      id="satVerbal"
                      type="number"
                      placeholder="700"
                      {...form.register('satVerbal', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ACT Scores */}
              <TabsContent value="act" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="actComposite">Composite</Label>
                    <Input
                      id="actComposite"
                      type="number"
                      placeholder="32"
                      {...form.register('actComposite', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actEnglish">English</Label>
                    <Input
                      id="actEnglish"
                      type="number"
                      placeholder="34"
                      {...form.register('actEnglish', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actMath">Math</Label>
                    <Input
                      id="actMath"
                      type="number"
                      placeholder="30"
                      {...form.register('actMath', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actReading">Reading</Label>
                    <Input
                      id="actReading"
                      type="number"
                      placeholder="33"
                      {...form.register('actReading', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actScience">Science</Label>
                    <Input
                      id="actScience"
                      type="number"
                      placeholder="31"
                      {...form.register('actScience', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* AP Exams */}
              <TabsContent value="ap" className="space-y-4">
                {apFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label>Subject</Label>
                      <Input
                        placeholder="Calculus BC"
                        {...form.register(`apExams.${index}.subject`)}
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Score</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        {...form.register(`apExams.${index}.score`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-28 space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...form.register(`apExams.${index}.year`, { valueAsNumber: true })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAP(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendAP({ subject: '', score: 5, year: new Date().getFullYear() })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add AP Exam
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Extracurricular Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Extracurricular Activities</CardTitle>
            <CardDescription>
              Add your clubs, sports, volunteer work, and other activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {extracurriculars.map((activity) => (
                <Badge key={activity} variant="secondary" className="px-3 py-1 gap-2">
                  {activity}
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(activity)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddActivity()
                  }
                }}
                placeholder="Student Council President, Varsity Soccer..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddActivity}
                disabled={!newActivity.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Academic Honors & Awards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Academic Honors & Awards
            </CardTitle>
            <CardDescription>
              Add your academic achievements and recognitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {honorFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Award Name</Label>
                      <Input
                        placeholder="National Merit Scholar"
                        {...form.register(`academicHonors.${index}.name`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...form.register(`academicHonors.${index}.year`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={form.watch(`academicHonors.${index}.level`) || undefined}
                        onValueChange={(value) => {
                          const validLevel = value as 'School' | 'District' | 'Regional' | 'State' | 'National' | 'International'
                          form.setValue(`academicHonors.${index}.level`, validLevel, { shouldDirty: true })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="District">District</SelectItem>
                          <SelectItem value="Regional">Regional</SelectItem>
                          <SelectItem value="State">State</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="Brief description of the award"
                        {...form.register(`academicHonors.${index}.description`)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHonor(index)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendHonor({ name: '', year: new Date().getFullYear(), description: '' })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Academic Honor
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Profile
          </Button>
          <div className="flex gap-3">
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
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your academic profile including all test scores, honors, and activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProfile.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? 'Deleting...' : 'Delete Profile'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
