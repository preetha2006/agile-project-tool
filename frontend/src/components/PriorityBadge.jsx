import React from 'react';
import { PRIORITY, PRIORITY_COLORS } from '../utils/constants';

const PriorityBadge = ({ priority }) => {
  const getDisplayPriority = (p) => PRIORITY[p] || p;
  const getColors = (p) => PRIORITY_COLORS[p] || 'text-text-muted';

  return (
    <span className={`text-xs font-medium ${getColors(priority)}`}>
      {getDisplayPriority(priority)}
    </span>
  );
};

export default PriorityBadge;
