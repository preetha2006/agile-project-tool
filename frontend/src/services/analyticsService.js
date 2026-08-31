import api from './api'

export const getProjectStats = (projectId) => api.get(`/analytics/project/${projectId}/stats`)
export const getBurndown = (sprintId) => api.get(`/analytics/sprint/${sprintId}/burndown`)
export const getVelocity = (projectId) => api.get(`/analytics/project/${projectId}/velocity`)
