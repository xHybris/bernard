import { createContext, useContext } from 'react'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_PROFILE = {
  firstName: '',
  notificationTime: '20:00',
  onboardingCompleted: false,
  dontAskSaveTemplate: false,
  selectedMuscleGroups: MUSCLE_GROUPS.map((group) => group.slug),
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useLocalStorage('bernard_profile', DEFAULT_PROFILE)

  const updateProfile = (updates) => {
    setProfile((previousProfile) => {
      const cleanProfile = { ...previousProfile }
      delete cleanProfile.age
      delete cleanProfile.bodyWeight
      delete cleanProfile.height
      return { ...cleanProfile, ...updates }
    })
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}
