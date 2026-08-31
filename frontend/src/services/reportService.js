import api from './api'

export const generateReport    = (projectId) => api.post('/reports/generate', { project_id: projectId })
export const getReport         = (reportId)  => api.get(`/reports/${reportId}`)
export const getProjectReports = (projectId) => api.get(`/reports/project/${projectId}`)
export const retryReport       = (reportId)  => api.post(`/reports/${reportId}/retry`)

// Triggers browser Save-to-Downloads dialog
export const downloadReport = async (reportId) => {
  const response = await fetch(`/api/reports/${reportId}/download`)
  if (!response.ok) throw new Error('Download failed')
  const blob     = await response.blob()
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  a.href         = url
  const cd       = response.headers.get('Content-Disposition') ?? ''
  a.download     = cd.match(/filename="?([^"]+)"?/)?.[1] ?? `report-${reportId}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
