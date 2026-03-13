import { useCallback, useState } from 'react'
import { MinusCircle } from 'lucide-react'
import './SetEditor.css'

export default function SetEditor({ sets, onChange }) {
  const [setCountInput, setSetCountInput] = useState(String(Math.max(sets.length, 1)))
  const [defaultWeight, setDefaultWeight] = useState(String(sets[0]?.weight ?? ''))
  const [defaultReps, setDefaultReps] = useState(String(sets[0]?.reps ?? ''))

  const buildSets = useCallback((count, weight, reps) => {
    const parsed = Number(count)
    const safeCount = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
    return Array.from({ length: safeCount }, () => ({ weight, reps }))
  }, [])

  const handleCountChange = (value) => {
    setSetCountInput(value)
    onChange(buildSets(value, defaultWeight, defaultReps))
  }

  const handleWeightChange = (value) => {
    setDefaultWeight(value)
    onChange(buildSets(setCountInput, value, defaultReps))
  }

  const handleRepsChange = (value) => {
    setDefaultReps(value)
    onChange(buildSets(setCountInput, defaultWeight, value))
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
