import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSprints } from '../hooks/useSprints';
import { createSprint } from '../services/sprintService';
import SprintCard from '../components/SprintCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Plus, X } from 'lucide-react';

export default function SprintBoard() {
  const { projectId } = useParams();
  const { sprints, loading, error, refetch } = useSprints(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '' });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (loading) return <LoadingState message="Loading sprints..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name || !formData.start_date || !formData.end_date) {
      setFormError('All fields are required');
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setFormError('Start date must be before end date');
      return;
    }
    try {
      await createSprint({ ...formData, project_id: projectId });
      setIsModalOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
      refetch();
    } catch (e) {
      setFormError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Sprints</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-text-primary text-bg-surface rounded hover:bg-text-secondary transition-colors"
        >
          <Plus size={18} />
          New Sprint
        </button>
      </div>

      {sprints.length === 0 ? (
        <EmptyState 
          title="No sprints found" 
          description="Plan your first sprint to start working on stories."
          actionText="Create Sprint"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {sprints.map(sprint => (
            <SprintCard key={sprint.id} sprint={sprint} onUpdate={refetch} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-bg-surface rounded-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Create Sprint</h2>
            
            {formError && (
              <div className="mb-4 text-red-700 bg-accent-rose/20 p-3 rounded text-sm border border-accent-rose">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Sprint Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-accent-blue bg-bg-primary text-text-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-accent-blue bg-bg-primary text-text-primary"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-accent-blue bg-bg-primary text-text-primary"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-text-primary text-bg-surface rounded hover:bg-text-secondary transition-colors">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
