import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import { GEMINI_API_KEY, AI_AGENTS, AGENT_PROMPTS } from './constant';
import NeuralBackground from './components/NeuralBackground';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import InputBar from './components/InputBar';
import WelcomeScreen from './components/WelcomeScreen';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const createSession = () => ({ id: uuidv4(), title: '', messages: [], agent: 'nexus' });

export default function App() {
  const init = useRef(createSession());
  const [sessions, setSessions]       = useState([init.current]);
  const [activeId, setActiveId]       = useState(init.current.id);
  const [agent, setAgent]             = useState('nexus');
  const [isLoading, setIsLoading]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ttsEnabled, setTtsEnabled]   = useState(false);
  const [mousePos, setMousePos]       = useState({ x: 0, y: 0 });
  const [bgIntensity, setBgIntensity] = useState(1);
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeId);
  const currentAgent  = AI_AGENTS.find(a => a.id === agent) || AI_AGENTS[0];

  /* ── Mouse parallax ── */
  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX - window.innerWidth / 2, y: e.clientY - window.innerHeight / 2 });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  /* ── Auto scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  /* ── Boost bg when typing ── */
  const handleTypingBoost = useCallback(() => {
    setBgIntensity(1.3);
    setTimeout(() => setBgIntensity(1), 1500);
  }, []);

  const notify = (msg, color = '#7c3aed') => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSession = useCallback((id, updater) => {
    setSessions(prev => prev.map(s => s.id === id ? updater(s) : s));
  }, []);

  /* ── Send message ── */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;
    handleTypingBoost();

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    updateSession(activeId, s => ({
      ...s,
      title: s.title || text.slice(0, 44),
      agent,
      messages: [...s.messages, userMsg],
    }));
    setIsLoading(true);

    try {
      const history = (activeSession?.messages ?? [])
        .slice(-12) // keep last 12 for context
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS.nexus;
      const fullPrompt = `${systemPrompt}\n\n${history ? `Previous conversation:\n${history}\n\n` : ''}User: ${text}\nAssistant:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const aiMsg = { role: 'assistant', content: response.text, timestamp: Date.now() };
      updateSession(activeId, s => ({ ...s, messages: [...s.messages, aiMsg] }));

      if (ttsEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(response.text.replace(/[#*`_~>]/g, '').slice(0, 500));
        utt.rate = 1.05; utt.pitch = 1;
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      const errText = err.message?.includes('429')
        ? '⚠️ Rate limit reached. Please wait a moment and try again.'
        : `⚠️ ${err.message}`;
      updateSession(activeId, s => ({
        ...s,
        messages: [...s.messages, { role: 'assistant', content: errText, timestamp: Date.now() }],
      }));
      notify(errText, '#ef4444');
    } finally {
      setIsLoading(false);
    }
  }, [activeId, activeSession, isLoading, agent, ttsEnabled, updateSession, handleTypingBoost]);

  /* ── Voice input ── */
  const handleVoiceInput = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { notify('Speech recognition not supported', '#ef4444'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false;
    rec.onresult = (e) => sendMessage(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
    notify('Listening…', currentAgent.color);
  }, [isListening, sendMessage, currentAgent.color]);

  const handleNewChat = () => {
    const s = createSession();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
  };

  const handleAgentChange = (id) => {
    setAgent(id);
    notify(`Switched to ${AI_AGENTS.find(a => a.id === id)?.label} agent`, AI_AGENTS.find(a => a.id === id)?.color);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#04040a' }}>

      {/* 3D Neural Background */}
      <NeuralBackground mousePos={mousePos} intensity={bgIntensity} />

      {/* Ambient glow blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle,${currentAgent.color}18,transparent)`, filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle,#06b6d418,transparent)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        agent={agent}
        onAgentChange={handleAgentChange}
        isOpen={sidebarOpen}
      />

      {/* Main OS shell */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? '256px' : '0px' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 flex flex-col h-screen"
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{
            background: 'rgba(4,4,12,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </motion.button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-600">NEXUS OS</span>
              <span className="text-zinc-700">/</span>
              <span style={{ color: currentAgent.color }}>{currentAgent.label}</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400 truncate max-w-[200px]">
                {activeSession?.title || 'New Session'}
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* TTS */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setTtsEnabled(v => !v); notify(ttsEnabled ? 'Voice off' : 'Voice on', currentAgent.color); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: ttsEnabled ? `${currentAgent.color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${ttsEnabled ? currentAgent.color + '35' : 'rgba(255,255,255,0.06)'}`,
                color: ttsEnabled ? currentAgent.color : '#52525b',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                {ttsEnabled && <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>}
              </svg>
              {ttsEnabled ? 'Voice On' : 'Voice Off'}
            </motion.button>

            {/* Agent badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
              style={{
                background: `${currentAgent.color}12`,
                border: `1px solid ${currentAgent.color}30`,
                color: currentAgent.color,
              }}
            >
              <span>{currentAgent.icon}</span>
              <span>{currentAgent.label}</span>
            </div>

            {/* System clock */}
            <SystemClock />
          </div>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${currentAgent.color}40 transparent` }}
        >
          {!activeSession || activeSession.messages.length === 0 ? (
            <WelcomeScreen agent={agent} onPrompt={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto">
              <AnimatePresence>
                {activeSession.messages.map((msg, i) => (
                  <MessageBubble
                    key={`${msg.timestamp}-${i}`}
                    msg={msg}
                    index={i}
                    agent={agent}
                  />
                ))}
                {isLoading && <TypingIndicator key="typing" agent={agent} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="px-5 pb-5 pt-2 flex-shrink-0"
          style={{
            background: 'rgba(4,4,12,0.6)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <InputBar
              onSend={sendMessage}
              isLoading={isLoading}
              onVoiceInput={handleVoiceInput}
              isListening={isListening}
              agentColor={currentAgent.color}
            />
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-zinc-700 text-xs">
                Nexus OS · {currentAgent.label} · gemini-2.5-flash
              </p>
              <p className="text-zinc-700 text-xs">
                {activeSession?.messages.length || 0} messages
              </p>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs text-white"
            style={{
              background: 'rgba(8,8,20,0.9)',
              border: `1px solid ${notification.color}40`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 20px ${notification.color}25`,
              color: notification.color,
            }}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── System clock ── */
function SystemClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-xs text-zinc-600 font-mono tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}
