import api from './api'

export const getStories = (params) => api.get('/stories', { params })
export const getStory = (id) => api.get(`/stories/${id}`)
export const createStory = (data) => api.post('/stories', data)
export const updateStory = (id, data) => api.put(`/stories/${id}`, data)
export const deleteStory = (id) => api.delete(`/stories/${id}`)
