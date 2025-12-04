/**
 * Example usage of useAcademicProfile hooks
 * This file demonstrates how to use the Academic Profile hooks in your components
 */

import { useAcademicProfile, useUpdateAcademicProfile } from './useAcademicProfile'
import type { AcademicProfileUpdateData } from '@/types/academicProfile'

/**
 * Example 1: Simple read-only component
 */
export function AcademicProfileDisplay() {
  const { data: profile, isLoading, isError } = useAcademicProfile()

  if (isLoading) return <div>Loading profile...</div>
  if (isError) return <div>Error loading profile</div>
  if (!profile) return <div>No profile found. Please create one.</div>

  return (
    <div>
      <h2>Academic Profile</h2>
      <p>GPA: {profile.gpa} / {profile.gpaScale}</p>
      <p>High School: {profile.highSchoolName}</p>
      <p>Graduation Year: {profile.gradYear}</p>
      <p>Primary Major: {profile.primaryMajor}</p>
      <p>Profile Completeness: {profile.completeness}%</p>
    </div>
  )
}

/**
 * Example 2: Component with update functionality
 */
export function AcademicProfileEditor() {
  const { data: profile, isLoading } = useAcademicProfile()
  const updateProfile = useUpdateAcademicProfile()

  const handleUpdate = async () => {
    const updates: AcademicProfileUpdateData = {
      gpa: 3.8,
      gpaScale: 4,
      primaryMajor: 'Computer Science',
      testScores: {
        SAT: {
          total: 1450,
          math: 750,
          verbal: 700,
        },
      },
    }

    updateProfile.mutate(updates, {
      onSuccess: () => {
        console.log('Profile updated successfully!')
      },
      onError: (error) => {
        console.error('Failed to update profile:', error)
      },
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>Edit Profile</h2>
      <button onClick={handleUpdate} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  )
}

/**
 * Example 3: Using the combined management hook
 */
export function AcademicProfileManager() {
  const {
    profile,
    isLoading,
    completeness,
    hasProfile,
    updateProfile,
    isUpdating,
    initializeProfile,
  } = useAcademicProfileManagement()

  if (isLoading) return <div>Loading...</div>

  if (!hasProfile) {
    return (
      <div>
        <p>You don't have an academic profile yet.</p>
        <button onClick={() => initializeProfile()}>
          Create Profile
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>Academic Profile</h2>
      <div>Progress: {completeness}%</div>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <button 
        onClick={() => updateProfile({ gpa: 4.0 })} 
        disabled={isUpdating}
      >
        {isUpdating ? 'Saving...' : 'Update GPA'}
      </button>
    </div>
  )
}

// Re-export the management hook for convenience
import { useAcademicProfileManagement } from './useAcademicProfile'
