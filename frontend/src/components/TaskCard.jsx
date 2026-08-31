import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY } from '../utils/constants';

export default function TaskCard({ task, index, onClick }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const priorityLabel = PRIORITY[task.priority] || 'Medium';

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-bg-surface border rounded-lg p-3 shadow-sm mb-3 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'border-accent-blue shadow-md rotate-2' : 'border-border hover:border-text-muted/30'
          }`}
          onClick={() => onClick && onClick(task)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
              {task.title}
            </h4>
            {task.is_blocked && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" title="Blocked" />
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-medium ${priorityColor}`}>
              {priorityLabel}
            </span>
            
            {(task.comment_count > 0 || task.comments?.length > 0) && (
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{task.comment_count || task.comments?.length || 0}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
