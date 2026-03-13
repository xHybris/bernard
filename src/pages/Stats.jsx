import { useMemo, useState } from 'react'
import { Bar, Line, Radar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import PeriodFilter from '../components/PeriodFilter'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { useSessions } from '../hooks/useSessions'
import './Stats.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
)

const axisOptions = {
  ticks: { color: '#b0b0b0' },
  grid: { color: 'rgba(255, 255, 255, 0.08)' },
}

const barOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: axisOptions,
    y: axisOptions,
  },
}

const lineOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: axisOptions,
    y: axisOptions,
  },
}

const radarOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    r: {
      ticks: { color: '#b0b0b0', backdropColor: 'transparent' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
      pointLabels: { color: '#b0b0b0', font: { size: 11 } },
    },
  },
}

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function sortByDate(items, getDate) {
  return [...items].sort((a, b) => new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime())
}

function filterByPeriod(sessions, period) {
  const now = new Date()
  return sessions.filter((session) => {
    const date = new Date(session.date)
    if (period === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }

    if (period === 'lastMonth') {
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return (
        date.getMonth() === previousMonth.getMonth() &&
        date.getFullYear() === previousMonth.getFullYear()
      )
    }

    if (period === 'year') {
      return date.getFullYear() === now.getFullYear()
    }

    return true
  })
}

function weekLabel(dateValue) {
  const date = new Date(dateValue)
  return `S${Math.ceil(date.getDate() / 7)}`
}

function monthLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString('fr-FR', {
    month: 'short',
    year: '2-digit',
  })
}

export default function Stats() {
  const { sessions } = useSessions()
  const [period, setPeriod] = useState('month')
  const [selectedExercise, setSelectedExercise] = useState('')

  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period])

  const sortedFiltered = useMemo(() => sortByDate(filtered, (session) => session.date), [filtered])

  const frequencyData = useMemo(() => {
    if (!sortedFiltered.length) {
      return null
    }

    const weekdayCounts = Array.from({ length: 7 }, () => 0)
    sortedFiltered.forEach((session) => {
      const dayIndex = new Date(session.date).getDay()
      const mondayFirstIndex = (dayIndex + 6) % 7
      weekdayCounts[mondayFirstIndex] += 1
    })

    return {
      labels: WEEKDAY_LABELS,
      datasets: [
        {
          data: weekdayCounts,
          backgroundColor: '#4361ee',
          borderRadius: 7,
        },
      ],
    }
  }, [sortedFiltered])

  const allExercises = useMemo(() => {
    const map = new Map()
    sortedFiltered.forEach((session) => {
      session.exercises.forEach((exercise) => {
        map.set(exercise.exerciseId, exercise.exerciseName)
      })
    })

    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [sortedFiltered])

  const exerciseForProgression = selectedExercise || allExercises[0]?.id || ''

  const progressionData = useMemo(() => {
    if (!exerciseForProgression) {
      return null
    }

    const points = []

    sortedFiltered.forEach((session) => {
      const exercise = session.exercises.find(
        (sessionExercise) => sessionExercise.exerciseId === exerciseForProgression,
      )

      if (!exercise || !exercise.sets.length) {
        return
      }

      const maxWeight = Math.max(...exercise.sets.map((setItem) => Number(setItem.weight) || 0))
      if (maxWeight <= 0) {
        return
      }

      points.push({ date: session.date, weight: maxWeight })
    })

    if (!points.length) {
      return null
    }

    return {
      labels: points.map((point) =>
        new Date(point.date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
      ),
      datasets: [
        {
          data: points.map((point) => point.weight),
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.14)',
          fill: true,
          tension: 0.28,
        },
      ],
    }
  }, [exerciseForProgression, sortedFiltered])

  const muscleData = useMemo(() => {
    const counts = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group.slug, 0]))

    sortedFiltered.forEach((session) => {
      session.exercises.forEach((exercise) => {
        counts[exercise.muscleGroup] = (counts[exercise.muscleGroup] || 0) + 1
      })
    })

    return {
      labels: MUSCLE_GROUPS.map((group) => group.name),
      datasets: [
        {
          data: MUSCLE_GROUPS.map((group) => counts[group.slug]),
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.25)',
          pointBackgroundColor: '#4361ee',
        },
      ],
    }
  }, [sortedFiltered])

  const ratingData = useMemo(() => {
    if (!sortedFiltered.length) {
      return null
    }

    const byWeek = period === 'month' || period === 'lastMonth'
    const buckets = {}

    sortedFiltered.forEach((session) => {
      const key = byWeek ? weekLabel(session.date) : monthLabel(session.date)
      if (!buckets[key]) {
        buckets[key] = []
      }
      buckets[key].push(Number(session.rating) || 0)
    })

    const labels = Object.keys(buckets)
    const values = labels.map((label) => {
      const list = buckets[label]
      return Number((list.reduce((sum, item) => sum + item, 0) / list.length).toFixed(1))
    })

    return {
      labels,
      datasets: [
        {
          data: values,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.18)',
          fill: true,
          tension: 0.25,
        },
      ],
    }
  }, [period, sortedFiltered])

  return (
    <div className="stats-page">
      <h2 className="page-title">Statistiques</h2>
      <PeriodFilter value={period} onChange={setPeriod} />

      {sortedFiltered.length === 0 ? (
        <p className="empty-text">Aucune donnée sur cette période.</p>
      ) : (
        <>
          <section className="chart-section card">
            <h3>Fréquence d&apos;entraînement</h3>
            {frequencyData && <Bar data={frequencyData} options={barOptions} />}
          </section>

          <section className="chart-section card">
            <h3>Progression poids soulevé</h3>
            <select value={exerciseForProgression} onChange={(event) => setSelectedExercise(event.target.value)}>
              {allExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            {progressionData ? (
              <Line data={progressionData} options={lineOptions} />
            ) : (
              <p className="empty-text">Pas de données pour cet exercice.</p>
            )}
          </section>

          <section className="chart-section card">
            <h3>Répartition musculaire</h3>
            <Radar data={muscleData} options={radarOptions} />
          </section>

          <section className="chart-section card">
            <h3>Historique des ressentis</h3>
            {ratingData && <Line data={ratingData} options={lineOptions} />}
          </section>
        </>
      )}
    </div>
  )
}
