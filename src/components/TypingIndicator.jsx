import { motion } from 'framer-motion';
import { AI_AGENTS } from '../constant';
import AgentOrb from './AgentOrb';

export default function TypingIndicator({ agent }) {
  const ag = AI_AGENTS.find(a => a.id === agent) || AI_AGENTS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-3 mb-5"
    >
      <AgentOrb agent={agent} isThinking size={32} />
      <div className="px-4 py-3 rounded-2xl flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ag.color }}
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: ag.color }}>{ag.label} is thinking…</span>
      </div>
    </motion.div>
  );
}
