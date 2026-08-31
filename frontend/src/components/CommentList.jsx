import React from 'react';
import EmptyState from './EmptyState';

function formatRelative(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CommentList({ comments = [], loading }) {
  if (loading) {
    return <div className="text-sm text-text-muted py-4">Loading comments...</div>;
  }
  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-sm text-text-muted">
        No comments yet. Be the first to comment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
            {comment.author ? comment.author.substring(0, 2).toUpperCase() : 'AN'}
          </div>
          <div className="flex-1 bg-bg-secondary border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm text-text-primary">{comment.author || 'Anonymous'}</span>
              <span className="text-xs text-text-muted">{formatRelative(comment.created_at)}</span>
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
