import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AI_AGENTS } from '../constant';
import AgentOrb from './AgentOrb';

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden my-3" style={{ border: '1px solid rgba(124,58,237,0.25)' }}>
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(124,58,237,0.12)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-xs text-purple-300 font-mono ml-1">{language || 'code'}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={copy}
          className="text-xs px-2 py-0.5 rounded transition-all"
          style={{
            background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
            color: copied ? '#10b981' : '#6b7280',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </motion.button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, background: 'rgba(2,2,8,0.8)', fontSize: '0.78rem', padding: '1rem' }}
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ msg, index, agent }) {
  const isUser = msg.role === 'user';
  const ag = AI_AGENTS.find(a => a.id === agent) || AI_AGENTS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.02, 0.2) }}
      className={`flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
          A
        </div>
      ) : (
        <div className="flex-shrink-0">
          <AgentOrb agent={agent} size={32} />
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{
          background: isUser
            ? `linear-gradient(135deg,${ag.color}28,${ag.color}12)`
            : 'rgba(255,255,255,0.03)',
          border: isUser
            ? `1px solid ${ag.color}35`
            : '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          color: '#e2e8f0',
          boxShadow: isUser ? `0 4px 24px ${ag.color}15` : 'none',
        }}
      >
        {/* Agent label for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-semibold" style={{ color: ag.color }}>{ag.label}</span>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-zinc-600 text-xs">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              code({ inline, className, children }) {
                const lang = /language-(\w+)/.exec(className || '')?.[1];
                return !inline
                  ? <CodeBlock language={lang}>{String(children).replace(/\n$/, '')}</CodeBlock>
                  : <code className="px-1.5 py-0.5 rounded font-mono text-xs"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd' }}>{children}</code>;
              },
              p: ({ children }) => <p className="mb-2 last:mb-0 text-zinc-200">{children}</p>,
              ul: ({ children }) => <ul className="list-none space-y-1 mb-2">{children}</ul>,
              li: ({ children }) => (
                <li className="flex gap-2 text-zinc-300">
                  <span style={{ color: ag.color }}>▸</span>
                  <span>{children}</span>
                </li>
              ),
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-zinc-300">{children}</ol>,
              h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2 mt-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-1 mt-2" style={{ color: ag.color }}>{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-cyan-300 mb-1 mt-2">{children}</h3>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="pl-3 my-2 text-zinc-400 italic"
                  style={{ borderLeft: `2px solid ${ag.color}` }}>{children}</blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-xs border-collapse"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-zinc-300"
                  style={{ background: `${ag.color}18`, borderBottom: `1px solid ${ag.color}30` }}>{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-zinc-400"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{children}</td>
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}

        {isUser && (
          <p className="text-xs mt-1.5 opacity-30 text-right">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
