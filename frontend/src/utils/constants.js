export const TASK_STATUS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
export const STORY_STATUS = { backlog: 'Backlog', in_sprint: 'In Sprint', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
export const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
export const PROJECT_STATUS = { active: 'Active', on_hold: 'On Hold', completed: 'Completed', archived: 'Archived' }
export const STORY_POINTS = [1, 2, 3, 5, 8]
export const SPRINT_STATUS = { planning: 'Planning', active: 'Active', completed: 'Completed' }

export const STATUS_COLORS = {
  todo: 'bg-bg-secondary text-text-secondary border-border',
  in_progress: 'bg-blue-50 text-blue-700 border-accent-blue',
  in_review: 'bg-yellow-50 text-yellow-700 border-accent-yellow',
  done: 'bg-green-50 text-green-700 border-accent-sage',
  backlog: 'bg-bg-secondary text-text-secondary border-border',
  in_sprint: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const PRIORITY_COLORS = {
  low: 'text-text-muted',
  medium: 'text-blue-600',
  high: 'text-amber-600',
  critical: 'text-red-600',
}
