import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { createTask } from "../services/taskService";
import { getStories } from "../services/storyService";
import { TASK_STATUS, PRIORITY } from "../utils/constants";

export default function TaskCreateModal({ projectId, onClose, onSuccess }) {
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    story_id: "",
    status: "todo",
    priority: "medium",
    assignee: "",
  });
  const modalRef = useRef();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStories({ project_id: projectId });
        setStories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, story_id: res.data[0].id }));
        }
      } catch (e) {
        setError("Could not load stories. Create a story first.");
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, [projectId]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError("Title is required"); return; }
    if (!formData.story_id) { setError("Please select a story"); return; }
    try {
      setSaving(true);
      setError(null);
      await createTask({
        title: formData.title,
        description: formData.description,
        story_id: parseInt(formData.story_id),
        status: formData.status,
        priority: formData.priority,
        assignee: formData.assignee || null,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to create task");
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleBackdropClick}>
      <div ref={modalRef} className="bg-bg-surface rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">New Task</h2>
          <button onClick={onClose} className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {loadingStories ? (
            <p className="text-text-secondary text-sm">Loading stories...</p>
          ) : stories.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-secondary mb-2">No stories found.</p>
              <p className="text-sm text-text-muted">Go to the Backlog tab and create a story first, then come back to add tasks.</p>
            </div>
          ) : (
            <form id="task-create-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  autoFocus
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Parent Story *</label>
                <select
                  name="story_id"
                  value={formData.story_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="">Select a story...</option>
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {Object.entries(PRIORITY).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {Object.entries(TASK_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Assignee</label>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Optional name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue resize-y"
                  placeholder="Optional details..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-bg-secondary flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md">
            Cancel
          </button>
          {stories.length > 0 && (
            <button
              type="submit"
              form="task-create-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-text-primary text-bg-surface rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Task"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
