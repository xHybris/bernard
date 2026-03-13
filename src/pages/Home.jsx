import { CalendarDays, Dumbbell, PlusCircle, Settings, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { MUSCLE_GROUP_NAMES } from '../data/muscleGroups'
import { useProfile } from '../contexts/ProfileContext'
import { useSessions } from '../hooks/useSessions'
import './Home.css'

function asDate(value) {
  return new Date(value)
}

function sameMonth(a, b) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getMusclesFromSession(session) {
  return [...new Set((session.exercises || []).map((exercise) => exercise.muscleGroup))]
}

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { sessions, deleteSession } = useSessions()

  const sortedSessions = [...sessions].sort(
    (a, b) => asDate(b.date).getTime() - asDate(a.date).getTime(),
  )

  const now = new Date()
  const monthSessions = sortedSessions.filter((session) => sameMonth(asDate(session.date), now))
  const lastSession = sortedSessions[0] || null

  const topMuscle = (() => {
    const counts = {}
    monthSessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        counts[exercise.muscleGroup] = (counts[exercise.muscleGroup] || 0) + 1
      })
    })

    const [slug] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []
    return slug ? MUSCLE_GROUP_NAMES[slug] : 'Aucun'
  })()

  const handleDeleteSession = (sessionId) => {
    const confirmed = window.confirm('Supprimer cette séance ?')
    if (!confirmed) {
      return
    }

    deleteSession(sessionId)
  }

  const formatMusclesText = (session) => {
    const muscles = getMusclesFromSession(session)
    if (muscles.length === 0) {
      return 'Aucun groupe renseigné'
    }
    return muscles.map((slug) => MUSCLE_GROUP_NAMES[slug]).join(', ')
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <p className="welcome">Salut {profile.firstName || 'champion'}.</p>
          <h1 className="page-title">Bernard</h1>
        </div>
        <Link to="/settings" className="settings-link" aria-label="Paramètres">
          <Settings size={20} />
        </Link>
      </header>

      <button type="button" className="btn-primary full-width new-session-btn" onClick={() => navigate('/session')}>
        <PlusCircle size={20} /> Nouvelle séance
      </button>

      <section className="home-grid">
        <article className="card metric-card">
          <CalendarDays size={18} />
          <div>
            <p className="metric-value">{monthSessions.length}</p>
            <p className="metric-label">Séances ce mois</p>
          </div>
        </article>

        <article className="card metric-card">
          <Dumbbell size={18} />
          <div>
            <p className="metric-value">{topMuscle}</p>
            <p className="metric-label">Muscle le plus travaillé</p>
          </div>
        </article>
      </section>

      <section className="card">
        <h2>Dernier entraînement</h2>
        {lastSession ? (
          <>
            <p className="last-date">{formatDate(lastSession.date)}</p>
            <p className="last-muscles">
              {formatMusclesText(lastSession)}
            </p>
          </>
        ) : (
          <p className="empty-text">Aucune séance enregistrée.</p>
        )}
      </section>

      <section className="home-history">
        <h2>Historique</h2>
        {sortedSessions.length === 0 ? (
          <p className="empty-text">Commence par ajouter ta première séance.</p>
        ) : (
          <div className="history-list">
            {sortedSessions.map((session) => (
              <article key={session.id} className="card history-card">
                <div className="history-top">
                  <div>
                    <h3>{formatDate(session.date)}</h3>
                    <p>
                      {formatMusclesText(session)}
                    </p>
                  </div>
                  <StarRating value={session.rating} onChange={() => {}} size={14} />
                </div>

                <div className="history-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/session/${session.id}/edit`)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 size={15} /> Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
