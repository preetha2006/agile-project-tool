import React from 'react';
import { STATUS_COLORS, TASK_STATUS, STORY_STATUS, SPRINT_STATUS } from '../utils/constants';

const StatusBadge = ({ status, type = 'task' }) => {
  const getDisplayStatus = (statusKey) => {
    if (!statusKey) return 'Unknown';
    if (type === 'story') return STORY_STATUS[statusKey] || statusKey;
    if (type === 'sprint') return SPRINT_STATUS[statusKey] || statusKey;
    return TASK_STATUS[statusKey] || statusKey;
  };

  const getColors = (statusKey) => {
    return STATUS_COLORS[statusKey] || 'bg-bg-secondary text-text-secondary border-border';
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getColors(status)}`}>
      {getDisplayStatus(status)}
    </span>
  );
};

export default StatusBadge;
