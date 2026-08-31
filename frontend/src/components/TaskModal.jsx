import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateTask, getTask } from '../services/taskService';
import { getComments, addComment } from '../services/commentService';
import CommentList from './CommentList';
import { TASK_STATUS, PRIORITY } from '../utils/constants';

export default function TaskModal({ task: initialTask, onClose, onSuccess }) {
  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'todo',
    priority: initialTask?.priority || 'medium',
    assignee: initialTask?.assignee || '',
    is_blocked: initialTask?.is_blocked || false,
  });

  const modalRef = useRef();

  // Load full task + comments when opened
  useEffect(() => {
    if (initialTask?.id) {
      fetchTask(initialTask.id);
      fetchComments(initialTask.id);
    }
  }, [initialTask?.id]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const fetchTask = async (id) => {
    try {
      setLoading(true);
      const res = await getTask(id);
      setTask(res.data);
      setFormData({
        title: res.data.title || '',
        description: res.data.description || '',
        status: res.data.status || 'todo',
        priority: res.data.priority || 'medium',
        assignee: res.data.assignee || '',
        is_blocked: res.data.is_blocked || false,
      });
    } catch (err) {
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id) => {
    try {
      setCommentsLoading(true);
      const res = await getComments(id);
      setComments(res.data || []);
    } catch (err) {
      // Non-fatal
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Title is required'); return; }
    try {
      setSaving(true);
      setError(null);
      await updateTask(task.id, formData);
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to save');
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      setAddingComment(true);
      await addComment(task.id, { author: commentAuthor.trim() || 'Anonymous', body: commentBody.trim() });
      setCommentBody('');
      setCommentAuthor('');
      await fetchComments(task.id);
    } catch (err) {
      // Non-fatal
    } finally {
      setAddingComment(false);
    }
  };

  const handleBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        ref={modalRef}
        className="bg-bg-surface h-full w-full max-w-xl flex flex-col shadow-2xl border-l border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Task Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Form */}
          <form id="task-form" onSubmit={handleSave} className="px-6 py-5 space-y-4 border-b border-border">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex gap-2 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Title</label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange} rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue resize-y"
                placeholder="Optional description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue">
                  {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue">
                  {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Assignee</label>
              <input
                type="text" name="assignee" value={formData.assignee} onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                placeholder="Name or initials"
              />
            </div>

            {/* Blocked */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_blocked" name="is_blocked" checked={formData.is_blocked} onChange={handleChange}
                className="w-4 h-4 rounded border-border text-accent-rose focus:ring-accent-rose" />
              <label htmlFor="is_blocked" className="text-sm text-text-primary">Mark as blocked</label>
            </div>

            {/* Story info */}
            {task?.story_title && (
              <div className="text-xs text-text-muted">
                Parent story: <span className="font-medium text-text-secondary">{task.story_title}</span>
              </div>
            )}
          </form>

          {/* Comments */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Comments</h3>
            <CommentList comments={comments} loading={commentsLoading} />

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="mt-4 space-y-2">
              <input
                type="text" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
              <textarea
                value={commentBody} onChange={e => setCommentBody(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue resize-none"
              />
              <button
                type="submit"
                disabled={!commentBody.trim() || addingComment}
                className="px-4 py-2 text-sm bg-bg-secondary text-text-primary border border-border rounded-md hover:bg-bg-primary disabled:opacity-50 transition-colors"
              >
                {addingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-bg-secondary flex-shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-bg-primary transition-colors">
            Cancel
          </button>
          <button
            form="task-form" type="submit" disabled={saving || loading}
            className="px-4 py-2 text-sm bg-text-primary text-bg-surface rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
