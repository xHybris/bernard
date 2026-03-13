import { useMemo, useState } from 'react'
import { ArrowLeft, Pencil, Play, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ExercisePicker from '../components/ExercisePicker'
import { useProfile } from '../contexts/ProfileContext'
import { useCustomExercises } from '../hooks/useCustomExercises'
import { useTemplates } from '../hooks/useTemplates'
import './Templates.css'

export default function Templates() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates()
  const { customExercises, addCustomExercise } = useCustomExercises()

  const [editingTemplateId, setEditingTemplateId] = useState(null)
  const [name, setName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [error, setError] = useState('')

  const selectedMuscleGroups = useMemo(() => {
    return profile.selectedMuscleGroups?.length
      ? profile.selectedMuscleGroups
      : ['pectoraux', 'dos', 'epaules', 'biceps', 'triceps', 'jambes', 'abdos']
  }, [profile.selectedMuscleGroups])

  const resetForm = () => {
    setEditingTemplateId(null)
    setName('')
    setSelectedExercises([])
    setError('')
  }

  const startEditing = (template) => {
    setEditingTemplateId(template.id)
    setName(template.name)
    setSelectedExercises(
      template.exercises.map((exercise) => ({
        ...exercise,
        sets: [{ weight: '', reps: '' }],
      })),
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const cleanName = name.trim()
    if (!cleanName) {
      setError('Le nom du template est requis.')
      return
    }

    if (!selectedExercises.length) {
      setError('Sélectionne au moins un exercice.')
      return
    }

    const templateExercises = selectedExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
    }))

    if (editingTemplateId) {
      updateTemplate(editingTemplateId, {
        name: cleanName,
        exercises: templateExercises,
      })
    } else {
      addTemplate(cleanName, templateExercises)
    }

    resetForm()
  }

  const removeTemplate = (templateId) => {
    const confirmed = window.confirm('Supprimer ce template ?')
    if (!confirmed) {
      return
    }

    deleteTemplate(templateId)
    if (editingTemplateId === templateId) {
      resetForm()
    }
  }

  return (
    <div className="templates-page">
      <header className="templates-header">
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <h2 className="page-title">Templates</h2>
      </header>

      <form className="template-form" onSubmit={handleSubmit}>
        <div className="card template-name-card">
          <h3>{editingTemplateId ? 'Modifier un template' : 'Créer un template'}</h3>
          <div className="form-group">
            <label>Nom du template</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Push complet"
            />
          </div>
        </div>

        <ExercisePicker
          selectedExercises={selectedExercises}
          onChange={setSelectedExercises}
          selectedMuscleGroups={selectedMuscleGroups}
          customExercises={customExercises}
          onCreateCustomExercise={addCustomExercise}
          mapExerciseToSelection={(exercise) => ({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: [{ weight: '', reps: '' }],
          })}
        />

        {error && <p className="template-error">{error}</p>}

        <div className="template-form-actions">
          <button type="submit" className="btn-primary">
            {editingTemplateId ? 'Enregistrer' : 'Créer'}
          </button>
          {editingTemplateId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <section className="templates-list">
        <h3>Templates existants</h3>
        {templates.length === 0 ? (
          <p className="empty-text">Aucun template pour le moment.</p>
        ) : (
          templates.map((template) => (
            <article key={template.id} className="card template-item">
              <div>
                <h4>{template.name}</h4>
                <p>{template.exercises.length} exercices</p>
              </div>

              <div className="template-item-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/session?template=${template.id}`)}
                >
                  <Play size={15} /> Utiliser
                </button>
                <button type="button" className="btn-outline" onClick={() => startEditing(template)}>
                  <Pencil size={15} /> Modifier
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeTemplate(template.id)}
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
