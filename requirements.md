You are building the complete React + Vite + Tailwind CSS frontend for an Agile Project Management Tool. The target directory is: C:\Users\Flora\.gemini\antigravity\scratch\agile-project-tool\frontend\

All directories already exist. Write every single file listed below with COMPLETE, PRODUCTION-QUALITY code. Do not skip any file. Do not use placeholder content.

---

## TECHNOLOGY
- React 18 + Vite + JavaScript (not TypeScript)
- Tailwind CSS
- React Router v6
- Axios
- Recharts (for burndown/velocity charts)
- @hello-pangea/dnd (drag and drop for kanban)

## DESIGN SYSTEM — CRITICAL, FOLLOW EXACTLY
Warm pastel palette. Minimalist. Professional. No neon. No gradients. No glassmorphism.

### Colors (configure in tailwind.config.js):
```js
colors: {
  bg: {
    primary: '#F5F0E8',
    secondary: '#EDE5D8',
    surface: '#FFFDF8',
  },
  text: {
    primary: '#3E3A35',
    secondary: '#777067',
    muted: '#9A8F85',
  },
  border: '#DED6C9',
  accent: {
    muted: '#C8B9A6',
    sage: '#B7C4B0',
    rose: '#D8B9B2',
    blue: '#B9C5D0',
    yellow: '#DCCB9A',
  }
}
```

### Status color mapping:
- todo: bg-bg-secondary text-text-secondary border-border
- in_progress: bg-accent-blue/20 text-blue-700 border-accent-blue
- in_review: bg-accent-yellow/20 text-yellow-700 border-accent-yellow
- done: bg-accent-sage/20 text-green-700 border-accent-sage
- blocked: bg-accent-rose/20 text-red-700 border-accent-rose

### Typography: font-sans (Inter via Google Fonts)

---

## FILES TO CREATE

### 1. `frontend/package.json`
```json
{
  "name": "agile-tool-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "recharts": "^2.12.0",
    "@hello-pangea/dnd": "^16.6.0",
    "lucide-react": "^0.300.0" 
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2. `frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})
```

### 3. `frontend/tailwind.config.js`
Full config with the complete custom color system above, content paths, fontFamily Inter.

### 4. `frontend/postcss.config.js`
Standard tailwind + autoprefixer.

### 5. `frontend/index.html`
Standard Vite HTML with Google Fonts Inter, root div, script src /src/main.jsx

### 6. `frontend/.env.example`
```
VITE_API_BASE_URL=http://localhost:8000
```

### 7. `frontend/.env`
Same as example.

### 8. `frontend/.gitignore`
node_modules, dist, .env

### 9. `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'Inter', sans-serif;
}

body {
  background-color: #F5F0E8;
  color: #3E3A35;
}

/* Thin scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #EDE5D8; }
::-webkit-scrollbar-thumb { background: #C8B9A6; border-radius: 2px; }
```

### 10. `frontend/src/main.jsx`
Standard React 18 entry point with BrowserRouter.

### 11. `frontend/src/App.jsx`
Routes:
- `/` → Dashboard
- `/projects/:projectId/board` → ProjectOverview (kanban board)
- `/projects/:projectId/backlog` → Backlog
- `/projects/:projectId/sprints` → SprintBoard
- `/projects/:projectId/analytics` → Analytics
Wrap in MainLayout.

---

## SERVICES LAYER

### 12. `frontend/src/services/api.js`
Axios instance with baseURL='/api' (uses Vite proxy), interceptors that handle errors and return consistent error messages.

### 13. `frontend/src/services/projectService.js`
```js
export const getProjects = () => api.get('/projects')
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
```

### 14. `frontend/src/services/sprintService.js`
```js
export const getSprints = (projectId) => api.get('/sprints', { params: { project_id: projectId } })
export const getSprint = (id) => api.get(`/sprints/${id}`)
export const createSprint = (data) => api.post('/sprints', data)
export const updateSprint = (id, data) => api.put(`/sprints/${id}`, data)
export const addStoriesToSprint = (sprintId, storyIds) => api.post(`/sprints/${sprintId}/stories`, { story_ids: storyIds })
```

### 15. `frontend/src/services/storyService.js`
CRUD for user stories with query params.

### 16. `frontend/src/services/taskService.js`
CRUD + status update + toggle-block.

### 17. `frontend/src/services/commentService.js`
getComments(taskId), addComment(taskId, data)

### 18. `frontend/src/services/analyticsService.js`
getProjectStats(projectId), getBurndown(sprintId), getVelocity(projectId)

### 19. `frontend/src/services/reportService.js`
generateReport(projectId), getReport(reportId), getProjectReports(projectId), retryReport(reportId)

---

## UTILS

### 20. `frontend/src/utils/constants.js`
```js
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
```

### 21. `frontend/src/utils/dateUtils.js`
Helper functions: formatDate(iso), formatRelative(iso), getDaysAgo(iso)

---

## HOOKS

### 22. `frontend/src/hooks/useProjects.js`
```js
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
```

### 23. `frontend/src/hooks/useStories.js`
Similar pattern, accepts projectId param, fetches stories for a project.

### 24. `frontend/src/hooks/useTasks.js`
Accepts storyId or sprintId filter.

### 25. `frontend/src/hooks/useSprints.js`
Accepts projectId.

---

## LAYOUT

### 26. `frontend/src/layouts/MainLayout.jsx`
Shell layout with:
- Fixed left sidebar (240px wide)
- Main content area (flex-1, scrollable)
- Sidebar contains: App logo/name, Projects list (collapsible), Nav links for active project
- Sidebar background: bg-bg-secondary, border-r border-border
- Main area background: bg-bg-primary

The sidebar should:
1. Show "Agile" logo text at top in text-text-primary font-semibold
2. Show list of projects (from API) with a + button to create new project
3. When a project is selected in the URL, show sub-navigation:
   - Board (kanban)
   - Backlog
   - Sprints
   - Analytics
4. Link items use NavLink with active state styling

---

## COMPONENTS

### 27. `frontend/src/components/Sidebar.jsx`
### 28. `frontend/src/components/Header.jsx`
### 29. `frontend/src/components/ProjectCard.jsx`
### 30. `frontend/src/components/StoryCard.jsx`
### 31. `frontend/src/components/TaskCard.jsx`
### 32. `frontend/src/components/KanbanColumn.jsx`
### 33. `frontend/src/components/TaskModal.jsx`
### 34. `frontend/src/components/StoryModal.jsx`
### 35. `frontend/src/components/ProjectModal.jsx`
### 36. `frontend/src/components/StatusBadge.jsx`
### 37. `frontend/src/components/PriorityBadge.jsx`
### 38. `frontend/src/components/ProgressBar.jsx`
### 39. `frontend/src/components/EmptyState.jsx`
### 40. `frontend/src/components/LoadingState.jsx`
### 41. `frontend/src/components/ErrorState.jsx`
### 42. `frontend/src/components/CommentList.jsx`
### 43. `frontend/src/components/CommentInput.jsx`
### 44. `frontend/src/components/SprintCard.jsx`
### 45. `frontend/src/components/AnalyticsCard.jsx`
### 46. `frontend/src/components/ReportStatus.jsx`

---

## PAGES

### 47. `frontend/src/pages/Dashboard.jsx`
### 48. `frontend/src/pages/ProjectOverview.jsx`
### 49. `frontend/src/pages/Backlog.jsx`
### 50. `frontend/src/pages/SprintBoard.jsx`
### 51. `frontend/src/pages/Analytics.jsx`

## IMPORTANT REQUIREMENTS

1. Write ALL files with complete, working JSX/JS code — no TODOs, no placeholders
2. Every component must handle loading, error, and empty states
3. All modals must have: overlay backdrop, close on backdrop click, close on Escape key, close X button
4. All forms must have client-side validation with error messages
5. Use React state (useState, useEffect) — no Redux
6. The Kanban drag-and-drop must work end-to-end with the API
7. TaskModal must refresh comments after adding a new comment
8. All API calls go through the services layer, not directly in components
9. The Sidebar must show the project list and update when a new project is created
10. Use `className` not `class` in JSX
11. All date fields in forms use `type="date"` HTML inputs
12. Sprint form dates must validate start < end
13. Error messages from API should be shown to user in error states
14. The app must have no broken routes — all links must lead somewhere
15. Fibonacci story point selector in StoryModal: show as clickable buttons (1, 2, 3, 5, 8), selected = bg-text-primary text-bg-surface
16. The burndown chart should handle the case where there's no active sprint gracefully
17. ReportStatus component polls every 3 seconds, but MUST clear the interval when component unmounts
18. In ProjectOverview, when fetching tasks, handle the case where a project has many stories efficiently
19. Make the layout responsive for desktop/laptop — sidebar collapses gracefully at smaller widths
20. DO NOT use emoji anywhere in the UI — use simple text or minimal SVG icons instead (lucide-react is added).
