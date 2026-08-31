import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateStory, createStory } from '../services/storyService';
import { STORY_STATUS, STORY_POINTS } from '../utils/constants';

export default function StoryModal({ story: initialStory, projectId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialStory?.title || '',
    description: initialStory?.description || '',
    status: initialStory?.status || 'backlog',
    points: initialStory?.points || null,
    project_id: projectId || initialStory?.project_id || '',
  });

  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePointSelect = (point) => {
    setFormData(prev => ({ 
      ...prev, 
      points: prev.points === point ? null : point 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      
      if (initialStory?.id) {
        await updateStory(initialStory.id, formData);
      } else {
        await createStory(formData);
      }
      
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save story');
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={handleBackdropClick}>
      <div ref={modalRef} className="bg-bg-surface rounded-xl shadow-2xl w-full max-w-xl flex flex-col my-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {initialStory?.id ? 'Edit Story' : 'New Story'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form id="story-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="As a user, I want to..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Description (Acceptance Criteria)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue resize-y"
                placeholder="Details and acceptance criteria..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                {Object.entries(STORY_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Story Points</label>
              <div className="flex flex-wrap gap-2">
                {STORY_POINTS.map(point => (
                  <button
                    key={point}
                    type="button"
                    onClick={() => handlePointSelect(point)}
                    className={`w-10 h-10 rounded-full font-medium transition-colors border ${
                      formData.points === point 
                        ? 'bg-text-primary text-bg-surface border-text-primary' 
                        : 'bg-bg-surface text-text-secondary border-border hover:border-accent-blue hover:text-text-primary'
                    }`}
                  >
                    {point}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-border bg-bg-secondary flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="story-form"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-text-primary text-bg-surface rounded-md hover:bg-text-secondary disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
