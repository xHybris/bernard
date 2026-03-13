import { useRef, useState } from 'react'
import { MinusCircle } from 'lucide-react'
import './SetEditor.css'

export default function SetEditor({ sets, onChange }) {
  const [setCountInput, setSetCountInput] = useState(String(Math.max(sets.length, 1)))
  const [defaultWeight, setDefaultWeight] = useState(String(sets[0]?.weight ?? ''))
  const [defaultReps, setDefaultReps] = useState(String(sets[0]?.reps ?? ''))
  const prevWeight = useRef(defaultWeight)
  const prevReps = useRef(defaultReps)

  const handleCountChange = (value) => {
    setSetCountInput(value)
    const parsed = Number(value)
    const safeCount = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
    const nextSets = Array.from({ length: safeCount }, (_, i) =>
      i < sets.length ? sets[i] : { weight: defaultWeight, reps: defaultReps },
    )
    onChange(nextSets)
  }

  const handleWeightChange = (value) => {
    const oldDefault = prevWeight.current
    setDefaultWeight(value)
    prevWeight.current = value
    onChange(
      sets.map((s) => (s.weight === oldDefault ? { ...s, weight: value } : s)),
    )
  }

  const handleRepsChange = (value) => {
    const oldDefault = prevReps.current
    setDefaultReps(value)
    prevReps.current = value
    onChange(
      sets.map((s) => (s.reps === oldDefault ? { ...s, reps: value } : s)),
    )
  }

  const updateSet = (index, key, value) => {
    const updated = sets.map((setItem, itemIndex) =>
      itemIndex === index ? { ...setItem, [key]: value } : setItem,
    )
    onChange(updated)
  }

  const removeSet = (index) => {
    if (sets.length <= 1) {
      return
    }

    const filtered = sets.filter((_, itemIndex) => itemIndex !== index)
    onChange(filtered)
    setSetCountInput(String(filtered.length))
  }

  return (
    <div className="set-editor">
      <div className="preset-row">
        <div className="preset-input">
          <label>Séries</label>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={setCountInput}
            onChange={(event) => handleCountChange(event.target.value)}
          />
        </div>
        <div className="preset-input">
          <label>Poids (kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={defaultWeight}
            onChange={(event) => handleWeightChange(event.target.value)}
          />
        </div>
        <div className="preset-input">
          <label>Reps</label>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={defaultReps}
            onChange={(event) => handleRepsChange(event.target.value)}
          />
        </div>
      </div>

      {sets.map((setItem, index) => (
        <div key={`set-${index + 1}`} className="set-row">
          <span className="set-label">Série {index + 1}</span>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            placeholder="Kg"
            value={setItem.weight}
            onChange={(event) => updateSet(index, 'weight', event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Reps"
            value={setItem.reps}
            onChange={(event) => updateSet(index, 'reps', event.target.value)}
          />
          <button
            type="button"
            className="remove-set"
            onClick={() => removeSet(index)}
            aria-label="Supprimer la série"
          >
            <MinusCircle size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
