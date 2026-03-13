import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExercisePicker from '../components/ExercisePicker'
import SetEditor from '../components/SetEditor'
import StarRating from '../components/StarRating'
import { MUSCLE_GROUP_NAMES } from '../data/muscleGroups'
import { useProfile } from '../contexts/ProfileContext'
import { useCustomExercises } from '../hooks/useCustomExercises'
import { useSessions } from '../hooks/useSessions'
import { useTemplates } from '../hooks/useTemplates'
import './Session.css'

function formatToday() {
  return new Date().toISOString().split('T')[0]
}

function parseNumber(value) {
  if (typeof value !== 'string') return Number(value)
  return Number(value.replace(',', '.'))
}

function normalizeSession(session) {
  return {
    date: session.date || formatToday(),
    rating: session.rating || 3,
    comment: session.comment || '',
    exercises: (session.exercises || []).map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      sets: (exercise.sets || []).map((setItem) => ({
        weight: String(setItem.weight ?? ''),
        reps: String(setItem.reps ?? ''),
      })),
    })),
  }
}

export default function Session() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { sessionId } = useParams()
  const isEditMode = Boolean(sessionId)

  const { profile, updateProfile } = useProfile()
  const { addSession, updateSession, getSessionById, getLastWeightForExercise } = useSessions()
  const { templates, addTemplate } = useTemplates()
  const { customExercises, addCustomExercise } = useCustomExercises()

  const editingSession = useMemo(() => {
    if (!sessionId) {
      return null
    }
    return getSessionById(sessionId) || null
  }, [getSessionById, sessionId])

  const templateIdFromQuery = !isEditMode ? searchParams.get('template') : null
  const templateFromQuery = templateIdFromQuery
    ? templates.find((item) => item.id === templateIdFromQuery) || null
    : null

  const initialState = useMemo(() => {
    if (isEditMode && editingSession) {
      const normalized = normalizeSession(editingSession)
      return {
        mode: 'manual',
        dateInput: normalized.date,
        selectedExercises: normalized.exercises,
        rating: normalized.rating,
        comment: normalized.comment,
        selectedTemplateId: '',
      }
    }

    if (!isEditMode && templateFromQuery) {
      return {
        mode: 'template',
        dateInput: formatToday(),
        selectedExercises: templateFromQuery.exercises.map((exercise) => ({
          ...exercise,
          sets: [
            {
              weight: String(getLastWeightForExercise(exercise.exerciseId) ?? ''),
              reps: '',
            },
          ],
        })),
        rating: 3,
        comment: '',
        selectedTemplateId: templateFromQuery.id,
      }
    }

    return {
      mode: isEditMode ? 'manual' : null,
      dateInput: formatToday(),
      selectedExercises: [],
      rating: 3,
      comment: '',
      selectedTemplateId: '',
    }
  }, [editingSession, getLastWeightForExercise, isEditMode, templateFromQuery])

  const [mode, setMode] = useState(() => initialState.mode)
  const [dateInput, setDateInput] = useState(() => initialState.dateInput)
  const [selectedExercises, setSelectedExercises] = useState(() => initialState.selectedExercises)
  const [rating, setRating] = useState(() => initialState.rating)
  const [comment, setComment] = useState(() => initialState.comment)
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => initialState.selectedTemplateId,
  )
  const [formError, setFormError] = useState('')
  const [templatePromptStep, setTemplatePromptStep] = useState('closed')
  const [templateName, setTemplateName] = useState('')
  const [lastSavedExercises, setLastSavedExercises] = useState([])
  const errorRef = useRef(null)

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [formError])

  const selectedMuscleGroups =
    profile.selectedMuscleGroups?.length > 0
      ? profile.selectedMuscleGroups
      : Object.keys(MUSCLE_GROUP_NAMES)

  const mapExerciseToSelection = (exercise) => {
    const suggestedWeight = getLastWeightForExercise(exercise.id, sessionId)
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: [{ weight: String(suggestedWeight ?? ''), reps: '' }],
    }
  }

  const applyTemplateById = (templateId) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((item) => item.id === templateId)
    if (!template) {
      return
    }

    setSelectedExercises(
      template.exercises.map((exercise) => ({
        ...exercise,
        sets: [
          {
            weight: String(getLastWeightForExercise(exercise.exerciseId) ?? ''),
            reps: '',
          },
        ],
      })),
    )
  }

  const updateExerciseSets = (exerciseId, sets) => {
    setSelectedExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, sets } : exercise,
      ),
    )
  }

  const removeExercise = (exerciseId) => {
    setSelectedExercises((currentExercises) =>
      currentExercises.filter((exercise) => exercise.exerciseId !== exerciseId),
    )
  }

  const toPayloadExercises = () => {
    return selectedExercises
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets
          .map((setItem) => ({
            weight: parseNumber(setItem.weight),
            reps: parseNumber(setItem.reps),
          }))
          .filter(
            (setItem) =>
              Number.isFinite(setItem.weight) &&
              Number.isFinite(setItem.reps) &&
              setItem.weight > 0 &&
              setItem.reps > 0,
          ),
      }))
      .filter((exercise) => exercise.sets.length > 0)
      .map(({ exerciseId, exerciseName, muscleGroup, sets }) => ({
        exerciseId,
        exerciseName,
        muscleGroup,
        sets,
      }))
  }

  const saveSession = () => {
    setFormError('')
    if (!dateInput) {
      setFormError('Sélectionne une date.')
      return
    }

    if (selectedExercises.length === 0) {
      setFormError('Ajoute au moins un exercice.')
      return
    }

    const payloadExercises = toPayloadExercises()

    if (selectedExercises.length > 0 && payloadExercises.length === 0) {
      setFormError('Remplis le poids et les reps d\u2019au moins une série.')
      return
    }

    const payload = {
      date: dateInput,
      exercises: payloadExercises,
      rating,
      comment: comment.trim(),
    }

    if (isEditMode) {
      updateSession(sessionId, payload)
      navigate('/')
      return
    }

    addSession(payload)
    setLastSavedExercises(payloadExercises)

    if (profile.dontAskSaveTemplate) {
      navigate('/')
      return
    }

    setTemplatePromptStep('ask')
  }

  const saveAsTemplate = () => {
    const cleanName = templateName.trim()
    if (!cleanName || !lastSavedExercises.length) {
      return
    }

    addTemplate(
      cleanName,
      lastSavedExercises.map(({ exerciseId, exerciseName, muscleGroup }) => ({
        exerciseId,
        exerciseName,
        muscleGroup,
      })),
    )
    navigate('/')
  }

  if (isEditMode && !editingSession) {
    return (
      <div className="session-page">
        <h2 className="page-title">Séance introuvable</h2>
        <Link to="/" className="btn-secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="session-page">
      <header className="session-header">
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <h2 className="page-title">{isEditMode ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
      </header>

      <section className="session-base card">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
          />
        </div>

        {!isEditMode && (
          <>
            <div className="mode-toggle">
              <button
                type="button"
                className={`chip ${mode === 'template' ? 'active' : ''}`}
                onClick={() => setMode('template')}
              >
                Depuis un template
              </button>
              <button
                type="button"
                className={`chip ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                Saisie manuelle
              </button>
            </div>

            {mode === 'template' && (
              <div className="form-group">
                <label>Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(event) => applyTemplateById(event.target.value)}
                >
                  <option value="">Choisir un template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </section>

      {(mode === 'manual' || isEditMode) && (
        <ExercisePicker
          selectedExercises={selectedExercises}
          onChange={setSelectedExercises}
          selectedMuscleGroups={selectedMuscleGroups}
          customExercises={customExercises}
          onCreateCustomExercise={addCustomExercise}
          mapExerciseToSelection={mapExerciseToSelection}
        />
      )}

      {selectedExercises.length > 0 && (
        <section className="selected-exercises">
          {selectedExercises.map((exercise) => (
            <article key={exercise.exerciseId} className="card selected-exercise-item">
              <div className="selected-exercise-head">
                <div>
                  <h3>{exercise.exerciseName}</h3>
                  <small>{MUSCLE_GROUP_NAMES[exercise.muscleGroup]}</small>
                </div>
                <button
                  type="button"
                  className="remove-exercise"
                  onClick={() => removeExercise(exercise.exerciseId)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <SetEditor
                sets={exercise.sets}
                onChange={(sets) => updateExerciseSets(exercise.exerciseId, sets)}
              />
            </article>
          ))}
        </section>
      )}

      <section className="session-feedback card">
        <h3>Ressenti de la séance</h3>
        <StarRating value={rating} onChange={setRating} />
        <div className="form-group">
          <label>Commentaire (optionnel)</label>
          <textarea
            rows="4"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comment tu t'es senti aujourd'hui ?"
          />
        </div>
      </section>

      {formError && <p ref={errorRef} className="session-error">{formError}</p>}

      <button type="button" className="btn-primary full-width save-session" onClick={saveSession}>
        <Save size={18} /> {isEditMode ? 'Enregistrer les modifications' : 'Valider la séance'}
      </button>

      {templatePromptStep !== 'closed' && (
        <div className="overlay">
          <div className="modal card">
            {templatePromptStep === 'ask' ? (
              <>
                <h3>Séance enregistrée !</h3>
                <p className="empty-text">Veux-tu sauvegarder cette structure comme template réutilisable ?</p>
                <div className="modal-actions">
                  <button type="button" className="btn-primary" onClick={() => setTemplatePromptStep('name')}>
                    Oui, créer un template
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                    Non merci
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      updateProfile({ dontAskSaveTemplate: true })
                      navigate('/')
                    }}
                  >
                    Ne plus demander
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Nom du template</h3>
                <input
                  type="text"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="Ex: Push jour 1"
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={saveAsTemplate}
                    disabled={!templateName.trim()}
                  >
                    Sauvegarder
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setTemplatePromptStep('ask')}
                  >
                    Retour
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
