import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createProject, updateProject } from '../services/projectService';
import { PROJECT_STATUS } from '../utils/constants';

export default function ProjectModal({ project: initialProject, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialProject?.name || '',
    description: initialProject?.description || '',
    status: initialProject?.status || 'active',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      
      if (initialProject?.id) {
        await updateProject(initialProject.id, formData);
      } else {
        await createProject(formData);
      }
      
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save project');
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
      <div ref={modalRef} className="bg-bg-surface rounded-xl shadow-2xl w-full max-w-md flex flex-col my-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {initialProject?.id ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue resize-y"
                placeholder="Optional project description..."
              />
            </div>

            {initialProject?.id && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {Object.entries(PROJECT_STATUS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}
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
            form="project-form"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-text-primary text-bg-surface rounded-md hover:bg-text-secondary disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
