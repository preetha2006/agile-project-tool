import { useState, useEffect } from 'react'
import { getProjects } from '../services/projectService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await getProjects()
      setProjects(res.data)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { fetchProjects() }, [])
  return { projects, loading, error, refetch: fetchProjects }
}
