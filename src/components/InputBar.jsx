import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUICK_PROMPTS } from '../constant';

export default function InputBar({ onSend, isLoading, onVoiceInput, isListening, agentColor }) {
  const [text, setText] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    setShowPrompts(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onSend(`[Attached: ${file.name}]\n\n${e.target.result}`);
    reader.readAsText(file);
  }; 

  const color = agentColor || '#7c3aed';

  return (
    <div className="relative">
      {/* Quick prompts */}
      <AnimatePresence>
        {showPrompts && !text && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute bottom-full mb-3 left-0 right-0 grid grid-cols-2 gap-2"
          >
            {QUICK_PROMPTS.map((p, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.02, borderColor: `${color}60` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setText(p.label); setShowPrompts(false); textareaRef.current?.focus(); }}
                className="text-left px-3 py-2.5 rounded-xl text-xs text-zinc-300 flex items-center gap-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <span>{p.icon}</span>
                <span className="truncate">{p.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input */}
      <motion.div
        animate={{
          borderColor: focused ? `${color}60` : dragOver ? `${color}90` : 'rgba(255,255,255,0.07)',
          boxShadow: focused ? `0 0 30px ${color}18` : 'none',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className="flex items-end gap-2 p-3 rounded-2xl transition-all"
        style={{
          background: 'rgba(6,6,16,0.85)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {/* Attach */}
        <Btn title="Attach file" onClick={() => fileRef.current?.click()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </Btn>

        {/* Quick prompts */}
        <Btn title="Quick prompts" onClick={() => setShowPrompts(v => !v)} active={showPrompts} color={color}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </Btn>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message Nexus OS… (Shift+Enter for new line)"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-zinc-600 text-sm resize-none outline-none leading-relaxed"
          style={{ maxHeight: '180px' }}
        />

        {/* Voice */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onVoiceInput}
          title="Voice input"
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: isListening ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.04)',
            color: isListening ? '#f87171' : '#52525b',
            border: isListening ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
          }}
        >
          {isListening ? (
            <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
              animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" stroke="currentColor" strokeWidth="2" fill="none"/>
            </motion.svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/>
            </svg>
          )}
        </motion.button>

        {/* Send */}
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: text.trim() && !isLoading
              ? `linear-gradient(135deg,${color},#06b6d4)`
              : 'rgba(255,255,255,0.04)',
            color: text.trim() && !isLoading ? 'white' : '#27272a',
            boxShadow: text.trim() && !isLoading ? `0 0 16px ${color}50` : 'none',
          }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full"
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

function Btn({ children, onClick, title, active, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      onClick={onClick} title={title}
      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: active ? `${color || '#7c3aed'}22` : 'rgba(255,255,255,0.04)',
        color: active ? (color || '#c4b5fd') : '#52525b',
      }}
    >
      {children}
    </motion.button>
  );
}
