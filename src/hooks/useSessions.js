import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useLocalStorage } from './useLocalStorage'

export function useSessions() {
  const [sessions, setSessions] = useLocalStorage('bernard_sessions', [])

  const addSession = useCallback(
    (sessionData) => {
      const session = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        ...sessionData,
      }
      setSessions((previousSessions) => [...previousSessions, session])
      return session
    },
    [setSessions],
  )

  const updateSession = useCallback(
    (id, updates) => {
      setSessions((previousSessions) =>
        previousSessions.map((session) =>
          session.id === id ? { ...session, ...updates } : session,
        ),
      )
    },
    [setSessions],
  )

  const deleteSession = useCallback(
    (id) => {
      setSessions((previousSessions) =>
        previousSessions.filter((session) => session.id !== id),
      )
    },
    [setSessions],
  )

  const getSessionById = useCallback(
    (id) => sessions.find((session) => session.id === id),
    [sessions],
  )

  const getLastWeightForExercise = useCallback(
    (exerciseId, excludeSessionId) => {
      const sorted = [...sessions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      for (let index = sorted.length - 1; index >= 0; index -= 1) {
        const session = sorted[index]
        if (excludeSessionId && session.id === excludeSessionId) {
          continue
        }

        const exercise = session.exercises.find(
          (currentExercise) => currentExercise.exerciseId === exerciseId,
        )
        if (!exercise || !exercise.sets.length) {
          continue
        }

        const lastSet = [...exercise.sets]
          .reverse()
          .find(
            (setItem) =>
              Number.isFinite(Number(setItem.weight)) && Number(setItem.weight) > 0,
          )

        if (lastSet) {
          return Number(lastSet.weight)
        }
      }

      return null
    },
    [sessions],
  )

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getSessionById,
    getLastWeightForExercise,
  }
}
