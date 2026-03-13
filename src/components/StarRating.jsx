import { Star } from 'lucide-react'
import './StarRating.css'

export default function StarRating({ value = 0, onChange, size = 20 }) {
  return (
    <div className="star-rating" role="radiogroup" aria-label="Ressenti">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          className={`star-btn ${value >= starValue ? 'active' : ''}`}
          onClick={() => onChange(starValue)}
          aria-label={`${starValue} étoile${starValue > 1 ? 's' : ''}`}
        >
          <Star size={size} fill={value >= starValue ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}
