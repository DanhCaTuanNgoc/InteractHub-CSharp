import { useCallback, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) {
      return initialValue
    }

    try {
      return JSON.parse(rawValue) as T
    } catch {
      return initialValue
    }
  })

  const save = useCallback(
    (nextValue: T) => {
      setValue(nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    },
    [key],
  )

  const clear = useCallback(() => {
    setValue(initialValue)
    localStorage.removeItem(key)
  }, [initialValue, key])

  return { value, save, clear }
}
