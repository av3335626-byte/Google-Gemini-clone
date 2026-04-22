import { motion } from 'framer-motion';
import { AI_AGENTS, QUICK_PROMPTS } from '../constant';

export default function WelcomeScreen({ agent, onPrompt }) {
  const ag = AI_AGENTS.find(a => a.id === agent) || AI_AGENTS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full text-center px-6 select-none"
    >
      {/* Central orb */}
      <div className="relative mb-10">
        {/* Outer spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 rounded-full"
          style={{ border: `1px solid ${ag.color}30` }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-8 rounded-full"
          style={{ border: `1px dashed ${ag.color}18` }}
        />

        {/* Core */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-full flex items-center justify-center relative"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${ag.color}cc, ${ag.color}22)`,
            boxShadow: `0 0 40px ${ag.color}40, 0 0 80px ${ag.color}15`,
            border: `1px solid ${ag.color}60`,
          }}
        >
          <span className="text-3xl text-white" style={{ textShadow: `0 0 20px ${ag.color}` }}>
            {ag.icon}
          </span>
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ag.color,
              boxShadow: `0 0 8px ${ag.color}`,
              top: '50%', left: '50%',
              marginTop: -4, marginLeft: -4,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: 'linear' }}
            transformTemplate={({ rotate }) =>
              `rotate(${rotate}) translateX(${44 + i * 14}px) rotate(-${rotate})`
            }
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-5xl font-black mb-1 tracking-tight glow-text"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${ag.color} 50%, #06b6d4 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          NEXUS OS
        </h1>
        <p className="text-zinc-500 text-sm mb-1">Next-Generation AI Operating System</p>
        <p className="text-xs font-medium" style={{ color: ag.color }}>
          {ag.label} Agent · {ag.desc}
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-6 mt-8 mb-8"
      >
        {[
          { label: 'Agents', value: '5' },
          { label: 'Model', value: '2.5 Flash' },
          { label: 'Memory', value: 'Active' },
          { label: 'Status', value: 'Online' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-white font-bold text-sm" style={{ color: ag.color }}>{s.value}</p>
            <p className="text-zinc-600 text-xs">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick prompts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-2 w-full max-w-lg"
      >
        {QUICK_PROMPTS.map((p, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03, borderColor: `${ag.color}50` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPrompt(p.label)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-left text-xs text-zinc-400 transition-all"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-base">{p.icon}</span>
            <span>{p.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
