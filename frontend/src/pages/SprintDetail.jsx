import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import KanbanColumn from "../components/KanbanColumn";
import TaskModal from "../components/TaskModal";
import TaskCreateModal from "../components/TaskCreateModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { ArrowLeft } from "lucide-react";
import { getTasks, updateTaskStatus } from "../services/taskService";
import { getStories } from "../services/storyService";
import api from "../services/api";

const COLUMNS = [
  { id: "todo",        label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review",   label: "In Review" },
  { id: "done",        label: "Done" },
];

export default function SprintDetail() {
  const { projectId, sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCreate, setShowTaskCreate] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get sprint info + stories in this sprint
      const [sprintRes, storiesRes] = await Promise.all([
        api.get(`/sprints/${sprintId}`),
        getStories({ sprint_id: sprintId }),
      ]);
      setSprint(sprintRes.data);

      const stories = storiesRes.data;
      if (stories.length === 0) {
        setTasks([]);
        return;
      }

      // Fetch tasks for all stories in this sprint
      const storyIds = stories.map((s) => s.id);
      const taskPromises = storyIds.map((sid) => getTasks({ story_id: sid }));
      const taskResults = await Promise.all(taskPromises);
      const allTasks = taskResults.flatMap((r) => r.data);
      setTasks(allTasks);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Failed to load sprint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [sprintId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      fetchAll();
    }
  };

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-border flex-shrink-0">
        <Link
          to={`/projects/${projectId}/sprints`}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft size={14} /> Back to Sprints
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {sprint?.name || "Sprint Board"}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {sprint?.status} &bull; {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowTaskCreate(true)}
            className="px-4 py-2 bg-text-primary text-bg-surface text-sm font-medium rounded-md hover:opacity-90"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks in this sprint yet"
            description="Add stories to this sprint from the Backlog, then create tasks under those stories."
            actionLabel="New Task"
            onAction={() => setShowTaskCreate(true)}
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 h-full">
              {COLUMNS.map((col) => (
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

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => { setSelectedTask(null); fetchAll(); }}
        />
      )}

      {showTaskCreate && (
        <TaskCreateModal
          projectId={parseInt(projectId)}
          onClose={() => setShowTaskCreate(false)}
          onSuccess={() => { setShowTaskCreate(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
