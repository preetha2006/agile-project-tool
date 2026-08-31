import { useState, useEffect, useCallback } from 'react'
import { getSprints } from '../services/sprintService'

export function useSprints(projectId) {
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchSprints = useCallback(async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const res = await getSprints(projectId)
      setSprints(res.data)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])
  
  useEffect(() => { fetchSprints() }, [fetchSprints])
  return { sprints, loading, error, refetch: fetchSprints }
}
