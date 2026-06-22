import { useState, useRef } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
  };

  return (
    <div className="border-t border-border bg-base px-4 py-3 flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Write a message..."
        className="flex-1 resize-none bg-surface-inset border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent transition-colors min-h-[38px] max-h-24"
      />
      <button
        onClick={submit}
        disabled={!content.trim() || disabled}
        className="flex-shrink-0 bg-accent hover:bg-accent-hover text-base text-sm font-medium px-4 py-2 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send →
      </button>
    </div>
  );
}
