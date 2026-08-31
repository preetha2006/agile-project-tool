import { useState, useEffect, useCallback } from 'react'
import { getTasks } from '../services/taskService'

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getTasks(filters)
      setTasks(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  return { tasks, setTasks, loading, error, refetch: fetchTasks }
}
