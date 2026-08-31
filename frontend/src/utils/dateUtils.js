export const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export const formatRelative = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const getDaysAgo = (isoString) => {
  if (!isoString) return 0
  const date = new Date(isoString)
  const now = new Date()
  const diffInTime = now.getTime() - date.getTime()
  return Math.floor(diffInTime / (1000 * 3600 * 24))
}
