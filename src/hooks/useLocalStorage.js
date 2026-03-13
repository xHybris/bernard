import { useCallback, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      setStoredValue((currentValue) => {
        const newValue = typeof value === 'function' ? value(currentValue) : value
        window.localStorage.setItem(key, JSON.stringify(newValue))
        return newValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
