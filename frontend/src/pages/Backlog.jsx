import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStories } from '../hooks/useStories';
import StoryCard from '../components/StoryCard';
import StoryModal from '../components/StoryModal';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Plus } from 'lucide-react';

export default function Backlog() {
  const { projectId } = useParams();
  const { stories, loading, error, refetch } = useStories(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  if (loading) return <LoadingState message="Loading backlog..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const backlogStories = stories.filter(s => s.status === 'backlog');

  const openModal = (story = null) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Backlog</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-text-primary text-bg-surface rounded hover:bg-text-secondary transition-colors"
        >
          <Plus size={18} />
          New Story
        </button>
      </div>

      {backlogStories.length === 0 ? (
        <EmptyState 
          title="Backlog is empty" 
          description="Create a user story to start planning your work."
          actionText="Create Story"
          onAction={() => openModal()}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {backlogStories.map(story => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={() => openModal(story)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <StoryModal 
          story={editingStory}
          projectId={projectId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStory(null);
          }} 
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingStory(null);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
