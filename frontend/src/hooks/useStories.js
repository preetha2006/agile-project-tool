import { useState, useEffect, useCallback } from 'react'
import { getStories } from '../services/storyService'

export function useStories(projectId) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchStories = useCallback(async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const res = await getStories({ project_id: projectId })
      setStories(res.data)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])
  
  useEffect(() => { fetchStories() }, [fetchStories])
  return { stories, loading, error, refetch: fetchStories }
}
