import React from 'react';
import { STORY_STATUS, STATUS_COLORS } from '../utils/constants';
import { BookOpen } from 'lucide-react';

export default function StoryCard({ story, onClick }) {
  const statusLabel = STORY_STATUS[story.status] || story.status;
  const statusColor = STATUS_COLORS[story.status] || STATUS_COLORS.todo;

  return (
    <div 
      className="bg-bg-surface border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(story)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
          <h4 className="font-medium text-text-primary">{story.title}</h4>
        </div>
      </div>
      
      <p className="text-sm text-text-secondary line-clamp-2 mb-3">
        {story.description || 'No description.'}
      </p>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className={`text-xs px-2 py-1 rounded-md border ${statusColor}`}>
          {statusLabel}
        </span>
        
        {story.points != null && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-blue/10 text-blue-700 text-xs font-semibold">
            {story.points}
          </span>
        )}
      </div>
    </div>
  );
}
