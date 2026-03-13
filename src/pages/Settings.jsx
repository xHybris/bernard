import { useState } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { useProfile } from '../contexts/ProfileContext'
import { requestNotificationPermission } from '../utils/notifications'
import './Settings.css'

const EXPORT_KEYS = [
  'bernard_profile',
  'bernard_exercises',
  'bernard_sessions',
  'bernard_templates',
]

export default function Settings() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()

  const [saved, setSaved] = useState(false)
  const [firstName, setFirstName] = useState(profile.firstName || '')
  const [notificationTime, setNotificationTime] = useState(profile.notificationTime || '20:00')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState(
    profile.selectedMuscleGroups?.length > 0
      ? profile.selectedMuscleGroups
      : MUSCLE_GROUPS.map((group) => group.slug),
  )

  const toggleMuscle = (slug) => {
    setSelectedMuscleGroups((previousGroups) => {
      const exists = previousGroups.includes(slug)
      return exists
        ? previousGroups.filter((item) => item !== slug)
        : [...previousGroups, slug]
    })
  }

  const saveProfile = async () => {
    updateProfile({
      firstName: firstName.trim(),
      notificationTime,
      selectedMuscleGroups:
        selectedMuscleGroups.length > 0
          ? selectedMuscleGroups
          : MUSCLE_GROUPS.map((group) => group.slug),
    })

    await requestNotificationPermission()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetOnboarding = () => {
    updateProfile({ onboardingCompleted: false })
    navigate('/')
  }

  const reEnableTemplatePrompt = () => {
    updateProfile({ dontAskSaveTemplate: false })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const exportDataObject = {}
    EXPORT_KEYS.forEach((key) => {
      exportDataObject[key] = JSON.parse(window.localStorage.getItem(key) || 'null')
    })

    const blob = new Blob([JSON.stringify(exportDataObject, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bernard-backup-${new Date().toISOString().split('T')[0]}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(String(loadEvent.target?.result || '{}'))
        Object.entries(parsed).forEach(([key, value]) => {
          if (EXPORT_KEYS.includes(key) && value !== null) {
            window.localStorage.setItem(key, JSON.stringify(value))
          }
        })
        window.location.reload()
      } catch {
        window.alert('Le fichier est invalide.')
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <h2 className="page-title">Paramètres</h2>
        {saved && <span className="saved-badge">Sauvegardé</span>}
      </header>

      <section className="card settings-section">
        <h3>Profil</h3>
        <div className="form-group">
          <label>Prénom</label>
          <input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </div>
      </section>

      <section className="card settings-section">
        <h3>Groupes musculaires</h3>
        <div className="chip-group">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group.slug}
              type="button"
              className={`chip ${selectedMuscleGroups.includes(group.slug) ? 'active' : ''}`}
              onClick={() => toggleMuscle(group.slug)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card settings-section">
        <h3>Notification</h3>
        <div className="form-group">
          <label>Heure du rappel</label>
          <input type="time" value={notificationTime} onChange={(event) => setNotificationTime(event.target.value)} />
        </div>
      </section>

      <button type="button" className="btn-primary full-width" onClick={saveProfile}>
        Sauvegarder les modifications
      </button>

      <section className="card settings-section">
        <h3>Données</h3>
        <div className="settings-actions">
          <button type="button" className="btn-outline" onClick={exportData}>
            <Download size={16} /> Exporter
          </button>
          <label className="btn-outline import-label">
            <Upload size={16} /> Importer
            <input type="file" accept=".json" hidden onChange={importData} />
          </label>
        </div>
      </section>

      <section className="card settings-section">
        <h3>Autres</h3>
        <button type="button" className="btn-secondary full-width" onClick={reEnableTemplatePrompt}>
          Réactiver la proposition de template
        </button>
        <button type="button" className="btn-danger full-width" onClick={resetOnboarding}>
          Réinitialiser l&apos;onboarding
        </button>
      </section>
    </div>
  )
}
