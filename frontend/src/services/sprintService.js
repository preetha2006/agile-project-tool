import api from './api'

export const getSprints = (projectId) => api.get('/sprints', { params: { project_id: projectId } })
export const getSprint = (id) => api.get(`/sprints/${id}`)
export const createSprint = (data) => api.post('/sprints', data)
export const updateSprint = (id, data) => api.put(`/sprints/${id}`, data)
export const addStoriesToSprint = (sprintId, storyIds) => api.post(`/sprints/${sprintId}/stories`, { story_ids: storyIds })
