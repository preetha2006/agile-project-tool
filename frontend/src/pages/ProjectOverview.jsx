import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StoryModal from '../components/StoryModal';
import { getProject } from '../services/projectService';
import { getStories } from '../services/storyService';
import { getTasks, updateTaskStatus } from '../services/taskService';
import { TASK_STATUS } from '../utils/constants';

const COLUMNS = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review',   label: 'In Review' },
  { id: 'done',        label: 'Done' },
];

export default function ProjectOverview() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCreate, setShowTaskCreate] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, storiesRes] = await Promise.all([
        getProject(projectId),
        getStories({ project_id: projectId }),
      ]);
      setProject(projRes.data);
      setStories(storiesRes.data);

      // Fetch all tasks for this project at once
      const tasksRes = await getTasks({ project_id: projectId });
      setTasks(tasksRes.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (e) {
      // Revert
      fetchAll();
    }
  };

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="px-8 pt-6 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{project?.name}</h1>
            <p className="text-sm text-text-secondary mt-0.5">Kanban Board</p>
          </div>
          <button
            onClick={() => setShowTaskCreate(true)}
            className="px-4 py-2 bg-text-primary text-bg-surface text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            + New Task
          </button>
        </div>

        {/* Stats bar */}
        {tasks.length > 0 && (
          <div className="flex gap-6 mt-4 text-sm text-text-secondary">
            <span><strong className="text-text-primary">{tasks.length}</strong> total tasks</span>
            <span><strong className="text-text-primary">{completedCount}</strong> done</span>
            <span><strong className="text-text-primary">{inProgressCount}</strong> in progress</span>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create a user story in the backlog, then add tasks to it."
            actionLabel="Go to Backlog"
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 h-full">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  columnId={col.id}
                  title={col.label}
                  tasks={tasksByStatus[col.id] || []}
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => { setSelectedTask(null); fetchAll(); }}
        />
      )}

      {/* Quick Task Create Modal */}
      {showTaskCreate && (
        <StoryModal
          projectId={parseInt(projectId)}
          onClose={() => setShowTaskCreate(false)}
          onSave={() => { setShowTaskCreate(false); fetchAll(); }}
          createTaskMode={true}
          stories={stories}
        />
      )}
    </div>
  );
}
