import { useRef } from 'react';
import { motion } from 'framer-motion';
import { AI_AGENTS } from '../constant';

/* Animated SVG orb that reacts to agent state */
export default function AgentOrb({ agent, isThinking, isListening, size = 48 }) {
  const ag = AI_AGENTS.find(a => a.id === agent) || AI_AGENTS[0];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer pulse rings */}
      {(isThinking || isListening) && [1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: `1px solid ${ag.color}`, inset: 0 }}
          animate={{ scale: [1, 1.8 + i * 0.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Core orb */}
      <motion.div
        className="relative rounded-full flex items-center justify-center font-bold text-white select-none"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${ag.color}cc, ${ag.color}44)`,
          boxShadow: `0 0 ${isThinking ? 30 : 12}px ${ag.color}66, inset 0 0 20px ${ag.color}22`,
          fontSize: size * 0.3,
          border: `1px solid ${ag.color}88`,
        }}
        animate={isThinking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 1.2, repeat: isThinking ? Infinity : 0 }}
      >
        {isListening ? (
          <motion.div className="flex gap-0.5 items-end" style={{ height: size * 0.35 }}>
            {[0,1,2,3,4].map(i => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: 3, background: ag.color }}
                animate={{ height: ['30%', '100%', '30%'] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        ) : (
          <span style={{ color: 'white', textShadow: `0 0 10px ${ag.color}` }}>
            {ag.icon}
          </span>
        )}
      </motion.div>
    </div>
  );
}
