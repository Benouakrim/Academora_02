/**
 * Complete Usage Examples for Academic Profile Mutations
 * Demonstrates real-time sync, optimistic updates, and CRUD operations
 */

import { useState } from 'react'
import {
  useCreateAcademicProfile,
  useUpdateAcademicProfile,
  useDeleteAcademicProfile,
  useBatchUpdateAcademicProfile,
} from './useAcademicProfileMutations'
import { useAcademicProfile } from './useAcademicProfile'
import type { AcademicProfileUpdateData } from '@/types/academicProfile'

/**
 * Example 1: Create Profile Form
 * Shows optimistic updates and real-time sync
 */
export function CreateProfileForm() {
  const createProfile = useCreateAcademicProfile()
  const [formData, setFormData] = useState<AcademicProfileUpdateData>({
    gpa: undefined,
    gpaScale: 4,
    primaryMajor: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mutation with optimistic update - UI updates immediately
    createProfile.mutate(formData, {
      onSuccess: (profile) => {
        console.log('Profile created:', profile)
        // All related queries are automatically invalidated for real-time sync
        // Matching engine, financial aid, etc. will refetch in background
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        step="0.01"
        value={formData.gpa || ''}
        onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
        placeholder="GPA"
      />
      <input
        type="text"
        value={formData.primaryMajor || ''}
        onChange={(e) => setFormData({ ...formData, primaryMajor: e.target.value })}
        placeholder="Primary Major"
      />
      <button type="submit" disabled={createProfile.isPending}>
        {createProfile.isPending ? 'Creating...' : 'Create Profile'}
      </button>
      {createProfile.isError && (
        <div className="error">{createProfile.error.message}</div>
      )}
    </form>
  )
}

/**
 * Example 2: Live Editing with Auto-Save
 * Demonstrates real-time updates across all components
 */
export function LiveGPAEditor() {
  const { data: profile } = useAcademicProfile()
  const updateProfile = useUpdateAcademicProfile()
  const [localGPA, setLocalGPA] = useState(profile?.gpa || 0)

  const handleBlur = () => {
    if (localGPA !== profile?.gpa) {
      // Optimistic update - changes appear immediately
      // Real-time sync - all components see the update instantly
      updateProfile.mutate({ gpa: localGPA })
    }
  }

  return (
    <div>
      <label>GPA:</label>
      <input
        type="number"
        step="0.01"
        value={localGPA}
        onChange={(e) => setLocalGPA(parseFloat(e.target.value))}
        onBlur={handleBlur}
        disabled={updateProfile.isPending}
      />
      {updateProfile.isPending && <span>Saving...</span>}
    </div>
  )
}

/**
 * Example 3: Complex Test Scores Form
 * Shows nested JSON updates with real-time sync
 */
export function TestScoresEditor() {
  const { data: profile } = useAcademicProfile()
  const updateProfile = useUpdateAcademicProfile()

  const handleSATUpdate = () => {
    const updates: AcademicProfileUpdateData = {
      testScores: {
        ...(profile?.testScores || {}),
        SAT: {
          total: 1450,
          math: 750,
          verbal: 700,
          date: new Date().toISOString(),
        },
      },
    }

    // Optimistic update + real-time sync
    // Matching engine automatically recalculates in background
    updateProfile.mutate(updates)
  }

  const handleAPExamAdd = () => {
    const currentAP = profile?.testScores?.AP || []
    const updates: AcademicProfileUpdateData = {
      testScores: {
        ...(profile?.testScores || {}),
        AP: [
          ...currentAP,
          {
            subject: 'Calculus BC',
            score: 5,
            year: 2024,
          },
        ],
      },
    }

    updateProfile.mutate(updates)
  }

  return (
    <div>
      <h3>Test Scores</h3>
      <button onClick={handleSATUpdate} disabled={updateProfile.isPending}>
        Update SAT Score
      </button>
      <button onClick={handleAPExamAdd} disabled={updateProfile.isPending}>
        Add AP Exam
      </button>
    </div>
  )
}

/**
 * Example 4: Batch Updates for Performance
 * Update multiple fields in a single API call
 */
export function CompleteProfileWizard() {
  const batchUpdate = useBatchUpdateAcademicProfile()
  const [step, setStep] = useState(1)
  const [academicData, setAcademicData] = useState<AcademicProfileUpdateData>({})
  const [testData, setTestData] = useState<AcademicProfileUpdateData>({})
  const [activitiesData, setActivitiesData] = useState<AcademicProfileUpdateData>({})

  const handleComplete = () => {
    // Batch all updates into one API call
    // Still gets optimistic update and real-time sync
    batchUpdate.mutate([academicData, testData, activitiesData], {
      onSuccess: () => {
        console.log('All sections saved!')
        // All related queries refetch automatically
      },
    })
  }

  return (
    <div className="wizard">
      {step === 1 && (
        <div>
          <h2>Step 1: Academic Info</h2>
          {/* Form fields for academicData */}
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Step 2: Test Scores</h2>
          {/* Form fields for testData */}
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Step 3: Activities</h2>
          {/* Form fields for activitiesData */}
          <button onClick={handleComplete} disabled={batchUpdate.isPending}>
            {batchUpdate.isPending ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Delete with Confirmation
 * Shows real-time sync when removing data
 */
export function DeleteProfileButton() {
  const deleteProfile = useDeleteAcademicProfile()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    // Optimistic update - profile disappears immediately
    // Real-time sync - all components update instantly
    // Matching engine, saved universities, etc. all refetch
    deleteProfile.mutate(undefined, {
      onSuccess: () => {
        console.log('Profile deleted - all related data synced')
        // Redirect to profile creation page
        window.location.href = '/profile/create'
      },
    })
  }

  return (
    <div>
      <button onClick={() => setShowConfirm(true)} className="btn-danger">
        Delete Profile
      </button>
      {showConfirm && (
        <div className="modal">
          <p>Are you sure? This will remove all academic data.</p>
          <button onClick={handleDelete} disabled={deleteProfile.isPending}>
            {deleteProfile.isPending ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  )
}

/**
 * Example 6: Real-time Completeness Indicator
 * Shows how mutations trigger immediate UI updates across components
 */
export function ProfileCompletenessWidget() {
  const { data: profile } = useAcademicProfile()
  const updateProfile = useUpdateAcademicProfile()

  // This component will update immediately when ANY mutation occurs
  // Thanks to query invalidation and real-time sync
  const completeness = profile?.completeness || 0

  const quickFills = [
    {
      label: 'Add High School',
      action: () => updateProfile.mutate({ highSchoolName: 'Sample High School' }),
    },
    {
      label: 'Add Graduation Year',
      action: () => updateProfile.mutate({ gradYear: 2025 }),
    },
    {
      label: 'Add Major',
      action: () => updateProfile.mutate({ primaryMajor: 'Computer Science' }),
    },
  ]

  return (
    <div className="completeness-widget">
      <h4>Profile Completeness: {completeness}%</h4>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${completeness}%` }}
        />
      </div>
      <p>Quick Actions to Complete Profile:</p>
      {quickFills.map((fill, idx) => (
        <button
          key={idx}
          onClick={fill.action}
          disabled={updateProfile.isPending}
        >
          {fill.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Example 7: Collaborative Editing Simulation
 * Multiple components editing different parts simultaneously
 */
export function CollaborativeEditDemo() {
  const { data: profile } = useAcademicProfile()
  const updateProfile = useUpdateAcademicProfile()

  // Component A updates GPA
  const ComponentA = () => (
    <button onClick={() => updateProfile.mutate({ gpa: 3.8 })}>
      Update GPA (Component A)
    </button>
  )

  // Component B updates major
  const ComponentB = () => (
    <button onClick={() => updateProfile.mutate({ primaryMajor: 'Biology' })}>
      Update Major (Component B)
    </button>
  )

  // Component C shows live data - updates immediately when A or B mutate
  const ComponentC = () => (
    <div className="live-preview">
      <h4>Live Data:</h4>
      <p>GPA: {profile?.gpa || 'Not set'}</p>
      <p>Major: {profile?.primaryMajor || 'Not set'}</p>
      <p>Last Updated: {profile?.updatedAt}</p>
    </div>
  )

  return (
    <div className="collaborative-demo">
      <h3>Real-time Sync Demo</h3>
      <div className="editors">
        <ComponentA />
        <ComponentB />
      </div>
      <div className="preview">
        <ComponentC />
      </div>
      <p className="note">
        ✨ All components sync in real-time through React Query!
      </p>
    </div>
  )
}
