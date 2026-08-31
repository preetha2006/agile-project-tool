import api from './api'

export const generateReport = (projectId) => api.post('/reports/generate', { project_id: projectId })
export const getReport = (reportId) => api.get(`/reports/${reportId}`)
export const getProjectReports = (projectId) => api.get(`/reports/project/${projectId}`)
export const retryReport = (reportId) => api.post(`/reports/${reportId}/retry`)
