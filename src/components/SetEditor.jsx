import { useMemo, useState } from 'react'
import { MinusCircle } from 'lucide-react'
import './SetEditor.css'

const emptySet = {
  weight: '',
  reps: '',
}

export default function SetEditor({ sets, onChange }) {
  const [setCountInput, setSetCountInput] = useState(String(Math.max(sets.length, 1)))
  const [defaultWeightInput, setDefaultWeightInput] = useState(String(sets[0]?.weight ?? ''))
  const [defaultRepsInput, setDefaultRepsInput] = useState(String(sets[0]?.reps ?? ''))

  const currentSetCount = useMemo(() => Math.max(sets.length, 1), [sets.length])

  const updateSet = (index, key, value) => {
    const updated = sets.map((setItem, itemIndex) =>
      itemIndex === index ? { ...setItem, [key]: value } : setItem,
    )
    onChange(updated)
  }

  const applyPreset = () => {
    const parsedCount = Number(setCountInput)
    const safeCount = Number.isFinite(parsedCount) ? Math.max(1, Math.floor(parsedCount)) : 1
    const nextSets = Array.from({ length: safeCount }, () => ({
      ...emptySet,
      weight: defaultWeightInput,
      reps: defaultRepsInput,
    }))
    onChange(nextSets)
    setSetCountInput(String(safeCount))
  }

  const removeSet = (index) => {
    if (sets.length <= 1) {
      return
    }

    onChange(sets.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="set-editor">
      <div className="preset-row">
        <div className="preset-input">
          <label>Nb séries</label>
          <input
            type="number"
            min="1"
            step="1"
            value={setCountInput}
            onChange={(event) => setSetCountInput(event.target.value)}
            placeholder={String(currentSetCount)}
          />
        </div>
        <div className="preset-input">
          <label>Poids (kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={defaultWeightInput}
            onChange={(event) => setDefaultWeightInput(event.target.value)}
          />
        </div>
        <div className="preset-input">
          <label>Reps</label>
          <input
            type="number"
            min="0"
            step="1"
            value={defaultRepsInput}
            onChange={(event) => setDefaultRepsInput(event.target.value)}
          />
        </div>
        <button type="button" className="btn-secondary apply-preset" onClick={applyPreset}>
          Appliquer
        </button>
      </div>

      {sets.map((setItem, index) => (
        <div key={`set-${index + 1}`} className="set-row">
          <span className="set-label">Série {index + 1}</span>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Kg"
            value={setItem.weight}
            onChange={(event) => updateSet(index, 'weight', event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="1"
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
