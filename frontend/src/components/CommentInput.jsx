import React, { useState } from 'react';
import { Send } from 'lucide-react';

const CommentInput = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <div className="w-8 h-8 rounded-full bg-accent-sage/30 flex items-center justify-center text-green-800 font-semibold text-xs shrink-0 mt-1">
        ME
      </div>
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-bg-surface border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage min-h-[80px] resize-y"
          disabled={isLoading}
        />
        <div className="absolute bottom-2 right-2 flex items-center">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="p-1.5 bg-accent-sage text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-sage/90 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
