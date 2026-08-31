import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MoreVertical } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { PROJECT_STATUS } from '../utils/constants';

export default function ProjectCard({ project, onEdit }) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-bg-surface border border-border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/projects/${project.id}/board`)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-text-primary line-clamp-1">{project.name}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(project);
          }}
          className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-bg-secondary"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">
        {project.description || 'No description provided.'}
      </p>
      
      <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>{project.created_at ? formatDate(project.created_at) : 'Unknown'}</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary font-medium">
          {PROJECT_STATUS[project.status] || project.status || 'Active'}
        </span>
      </div>
    </div>
  );
}
