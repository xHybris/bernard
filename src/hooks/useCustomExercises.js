import { v4 as uuid } from 'uuid'
import { useLocalStorage } from './useLocalStorage'

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useLocalStorage('bernard_exercises', [])

  const addCustomExercise = (name, muscleGroup) => {
    const exercise = {
      id: uuid(),
      name: name.trim(),
      muscleGroup,
    }

    setCustomExercises((previousExercises) => [...previousExercises, exercise])
    return exercise
  }

  const getCustomByGroup = (group) =>
    customExercises.filter((exercise) => exercise.muscleGroup === group)

  return { customExercises, addCustomExercise, getCustomByGroup }
}
