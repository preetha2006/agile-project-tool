import api from './api'

export const getTasks = (params) => api.get('/tasks', { params })
export const getTask = (id) => api.get(`/tasks/${id}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status })
export const toggleTaskBlock = (id) => api.patch(`/tasks/${id}/toggle-block`)
