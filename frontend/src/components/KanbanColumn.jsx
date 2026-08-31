import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function KanbanColumn({ columnId, title, tasks, onTaskClick }) {
  return (
    <div className="flex flex-col bg-bg-secondary rounded-lg w-72 shrink-0 max-h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-text-secondary text-xs font-medium">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-bg-primary/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
