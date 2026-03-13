import { useState } from 'react'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { useProfile } from '../contexts/ProfileContext'
import { requestNotificationPermission } from '../utils/notifications'
import './Onboarding.css'

export default function Onboarding() {
  const { profile, updateProfile } = useProfile()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    selectedMuscleGroups:
      profile.selectedMuscleGroups?.length > 0
        ? profile.selectedMuscleGroups
        : MUSCLE_GROUPS.map((group) => group.slug),
    notificationTime: profile.notificationTime || '20:00',
  })

  const toggleMuscle = (slug) => {
    setForm((previousForm) => {
      const exists = previousForm.selectedMuscleGroups.includes(slug)
      if (exists) {
        return {
          ...previousForm,
          selectedMuscleGroups: previousForm.selectedMuscleGroups.filter(
            (groupSlug) => groupSlug !== slug,
          ),
        }
      }

      return {
        ...previousForm,
        selectedMuscleGroups: [...previousForm.selectedMuscleGroups, slug],
      }
    })
  }

  const finishOnboarding = () => {
    updateProfile({
      firstName: form.firstName.trim(),
      notificationTime: form.notificationTime,
      selectedMuscleGroups:
        form.selectedMuscleGroups.length > 0
          ? form.selectedMuscleGroups
          : MUSCLE_GROUPS.map((group) => group.slug),
      onboardingCompleted: true,
    })
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card card">
        <div className="onboarding-progress">Étape {step + 1} / 4</div>

        {step === 0 && (
          <section className="onboarding-step">
            <h1>Bienvenue sur Bernard</h1>
            <p>
              Bernard t&apos;aide à suivre tes séances, tes progrès et ton ressenti à chaque
              entraînement.
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-step">
            <h2>Ton profil</h2>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    firstName: event.target.value,
                  }))
                }
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-step">
            <h2>Groupes musculaires</h2>
            <p>Sélectionne les groupes que tu travailles régulièrement.</p>
            <div className="chip-group">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group.slug}
                  type="button"
                  className={`chip ${
                    form.selectedMuscleGroups.includes(group.slug) ? 'active' : ''
                  }`}
                  onClick={() => toggleMuscle(group.slug)}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="onboarding-step">
            <h2>Rappel quotidien</h2>
            <p>Choisis une heure pour te rappeler de saisir ta séance.</p>
            <div className="form-group">
              <label>Heure de notification</label>
              <input
                type="time"
                value={form.notificationTime}
                onChange={(event) =>
                  setForm((previousForm) => ({
                    ...previousForm,
                    notificationTime: event.target.value,
                  }))
                }
              />
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={requestNotificationPermission}
            >
              Autoriser les notifications
            </button>
          </section>
        )}

        <div className="onboarding-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={step === 0}
            onClick={() => setStep((currentStep) => Math.max(currentStep - 1, 0))}
          >
            Retour
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep((currentStep) => Math.min(currentStep + 1, 3))}
            >
              Continuer
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={finishOnboarding}>
              Démarrer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
