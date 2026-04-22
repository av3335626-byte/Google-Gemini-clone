import { motion, AnimatePresence } from 'framer-motion';
import { AI_AGENTS } from '../constant';
import AgentOrb from './AgentOrb';

export default function Sidebar({ sessions, activeId, onSelect, onNew, agent, onAgentChange, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed left-0 top-0 h-full w-64 z-30 flex flex-col scanline"
          style={{
            background: 'rgba(4,4,12,0.92)',
            backdropFilter: 'blur(28px) saturate(180%)',
            borderRight: '1px solid rgba(124,58,237,0.15)',
          }}
        >
          {/* Logo */}
          <div className="px-5 py-5 flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'conic-gradient(from 0deg,#7c3aed,#06b6d4,#a855f7,#7c3aed)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                style={{ background: 'rgba(4,4,12,0.9)' }}>✦</div>
            </motion.div>
            <div>
              <p className="text-white font-bold text-sm tracking-widest">NEXUS OS</p>
              <p className="text-zinc-500 text-xs">v2.0 · AI Native</p>
            </div>
          </div>

          {/* New Chat */}
          <div className="px-4 mb-5">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={onNew}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(6,182,212,0.3))',
                border: '1px solid rgba(124,58,237,0.4)',
              }}
            >
              <span className="text-lg leading-none">+</span> New Session
            </motion.button>
          </div>

          {/* AI Agents */}
          <div className="px-4 mb-4">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 px-1 font-medium">AI Agents</p>
            <div className="space-y-1">
              {AI_AGENTS.map(ag => (
                <motion.button
                  key={ag.id}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAgentChange(ag.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: agent === ag.id ? `${ag.color}18` : 'transparent',
                    border: `1px solid ${agent === ag.id ? ag.color + '40' : 'transparent'}`,
                  }}
                >
                  <AgentOrb agent={ag.id} size={28} />
                  <div className="text-left">
                    <p className="text-xs font-semibold" style={{ color: agent === ag.id ? ag.color : '#9ca3af' }}>
                      {ag.label}
                    </p>
                    <p className="text-xs text-zinc-600">{ag.desc}</p>
                  </div>
                  {agent === ag.id && (
                    <motion.div
                      layoutId="activeAgent"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: ag.color, boxShadow: `0 0 6px ${ag.color}` }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-4">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2 px-1 font-medium">Sessions</p>
            <div className="space-y-0.5">
              {sessions.map(s => (
                <motion.button
                  key={s.id}
                  whileHover={{ x: 3 }}
                  onClick={() => onSelect(s.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-all"
                  style={{
                    background: activeId === s.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: activeId === s.id ? '#c4b5fd' : '#52525b',
                    border: activeId === s.id ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  }}
                >
                  <span className="mr-2 opacity-50">◈</span>
                  {s.title || 'New session'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
              <span className="text-xs text-zinc-500">All systems operational</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>A</div>
              <div>
                <p className="text-white text-xs font-semibold">Amit Kumar</p>
                <p className="text-zinc-600 text-xs">Nexus Pro</p>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
