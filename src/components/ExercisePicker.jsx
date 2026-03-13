import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PREDEFINED_EXERCISES } from '../data/exercises'
import { MUSCLE_GROUPS, MUSCLE_GROUP_NAMES } from '../data/muscleGroups'
import './ExercisePicker.css'

function defaultMapper(exercise) {
  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: [{ weight: '', reps: '' }],
  }
}

export default function ExercisePicker({
  selectedExercises,
  onChange,
  selectedMuscleGroups,
  customExercises,
  onCreateCustomExercise,
  mapExerciseToSelection = defaultMapper,
}) {
  const [activeGroup, setActiveGroup] = useState(selectedMuscleGroups[0] ?? MUSCLE_GROUPS[0].slug)
  const [showAllGroups, setShowAllGroups] = useState(false)
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')

  const visibleGroups = useMemo(() => {
    if (showAllGroups) {
      return MUSCLE_GROUPS
    }

    const set = new Set(selectedMuscleGroups)
    const filtered = MUSCLE_GROUPS.filter((group) => set.has(group.slug))
    return filtered.length ? filtered : MUSCLE_GROUPS
  }, [selectedMuscleGroups, showAllGroups])
  const effectiveActiveGroup = visibleGroups.some((group) => group.slug === activeGroup)
    ? activeGroup
    : (visibleGroups[0]?.slug ?? MUSCLE_GROUPS[0].slug)

  const selectedSet = useMemo(
    () => new Set(selectedExercises.map((exercise) => exercise.exerciseId)),
    [selectedExercises],
  )

  const exercisesForGroup = useMemo(() => {
    const fromPredefined = PREDEFINED_EXERCISES.filter(
      (exercise) => exercise.muscleGroup === effectiveActiveGroup,
    )
    const fromCustom = customExercises
      .filter((exercise) => exercise.muscleGroup === effectiveActiveGroup)
      .map((exercise) => ({ ...exercise, id: exercise.id }))

    const all = [...fromPredefined, ...fromCustom]
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) {
      return all
    }

    return all.filter((exercise) => exercise.name.toLowerCase().includes(normalizedSearch))
  }, [customExercises, effectiveActiveGroup, search])

  const toggleExercise = (exercise) => {
    const exists = selectedSet.has(exercise.id)
    if (exists) {
      onChange(
        selectedExercises.filter(
          (selectedExercise) => selectedExercise.exerciseId !== exercise.id,
        ),
      )
      return
    }

    onChange([...selectedExercises, mapExerciseToSelection(exercise)])
  }

  const createExercise = () => {
    const name = customName.trim()
    if (!name) {
      return
    }

    const created = onCreateCustomExercise(name, effectiveActiveGroup)
    setCustomName('')
    onChange([...selectedExercises, mapExerciseToSelection(created)])
  }

  return (
    <div className="exercise-picker card">
      <h3>Choisir les exercices</h3>

      <div className="chip-group">
        {visibleGroups.map((group) => (
          <button
            key={group.slug}
            type="button"
            className={`chip ${effectiveActiveGroup === group.slug ? 'active' : ''}`}
            onClick={() => setActiveGroup(group.slug)}
          >
            {group.name}
          </button>
        ))}
      </div>

      {!showAllGroups && selectedMuscleGroups.length < MUSCLE_GROUPS.length && (
        <button type="button" className="show-all-groups" onClick={() => setShowAllGroups(true)}>
          Voir tous les groupes
        </button>
      )}

      <input
        type="text"
        placeholder="Rechercher un exercice"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="exercise-list">
        {exercisesForGroup.length ? (
          exercisesForGroup.map((exercise) => {
            const selected = selectedSet.has(exercise.id)
            return (
              <button
                key={exercise.id}
                type="button"
                className={`exercise-item ${selected ? 'selected' : ''}`}
                onClick={() => toggleExercise(exercise)}
              >
                <span>{exercise.name}</span>
                <small>{MUSCLE_GROUP_NAMES[exercise.muscleGroup]}</small>
              </button>
            )
          })
        ) : (
          <p className="empty-text">Aucun exercice dans ce groupe</p>
        )}
      </div>

      <div className="create-custom-row">
        <input
          type="text"
          value={customName}
          onChange={(event) => setCustomName(event.target.value)}
          placeholder="Ajouter un exercice perso"
        />
        <button type="button" className="btn-secondary" onClick={createExercise}>
          <Plus size={16} /> Ajouter
        </button>
      </div>
    </div>
  )
}
