import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatDate } from '../utils/dateUtils';

const SprintCard = ({ sprint, projectId }) => {
  if (!sprint) return null;

  const progress = sprint.progress !== undefined ? sprint.progress : 0;

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-text-primary text-lg">{sprint.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
            <Calendar size={14} />
            <span>
              {sprint.start_date ? formatDate(sprint.start_date) : 'TBD'} - 
              {sprint.end_date ? formatDate(sprint.end_date) : 'TBD'}
            </span>
          </div>
        </div>
        <StatusBadge status={sprint.status} type="sprint" />
      </div>
      
      {sprint.goal && (
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {sprint.goal}
        </p>
      )}
      
      <div className="mb-4">
        <ProgressBar progress={progress} label="Sprint Progress" />
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-border">
        <div className="text-xs text-text-muted">
          <span className="font-medium text-text-primary">{sprint.completed_points || 0}</span> / {sprint.total_points || 0} pts
        </div>
        
        <Link 
          to={`/projects/${projectId}/sprints/${sprint.id}`}
          className="text-sm font-medium text-text-primary hover:text-accent-sage flex items-center gap-1"
        >
          View Board
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default SprintCard;
