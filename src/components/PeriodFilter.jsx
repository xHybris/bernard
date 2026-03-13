import './PeriodFilter.css'

const PERIODS = [
  { key: 'month', label: 'Ce mois' },
  { key: 'lastMonth', label: 'Mois dernier' },
  { key: 'year', label: 'Année' },
  { key: 'all', label: 'Depuis le début' },
]

export default function PeriodFilter({ value, onChange }) {
  return (
    <div className="period-filter">
      {PERIODS.map((period) => (
        <button
          key={period.key}
          type="button"
          className={`period-pill ${value === period.key ? 'active' : ''}`}
          onClick={() => onChange(period.key)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
