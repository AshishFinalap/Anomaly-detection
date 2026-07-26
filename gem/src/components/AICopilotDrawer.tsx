import React, { useState } from 'react';
import { X, Send, Bot, User, Sparkles, Shield, Cpu, Terminal } from 'lucide-react';
import { DetectionResult } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlerts: DetectionResult[];
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose, activeAlerts }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: "Welcome to Aegis CyberShield AI Copilot powered by Gemini 3.6 Flash. I am actively auditing telemetry stream events and dual-model ML predictions. How can I assist your SOC containment or forensic investigation?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "Summarize active industrial threats",
    "Generate iptables IP block commands",
    "Explain impossible travel detection logic",
  ];

  const handleSend = (textToSend?: string) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim() || isSending) return;

    setMessages((prev) => [...prev, { sender: 'user', text: prompt }]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    fetch('/api/chat-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        context: {
          activeAlertsCount: activeAlerts.length,
          topAlerts: activeAlerts.slice(0, 3).map((a) => ({
            entity: a.event.entity_id,
            type: a.predicted_label,
            risk: a.risk_score,
            ip: a.event.source_ip,
          })),
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply || 'No response.' }]);
        setIsSending(false);
      })
      .catch((err) => {
        console.error('Failed to chat:', err);
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error communicating with the AI service.' }]);
        setIsSending(false);
      });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-lg text-white font-extrabold text-xs shadow-md">
            AEGIS
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Aegis CyberShield Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Gemini 3.6 Flash Industrial Threat Assistant</p>
          </div>
        </div>

        <button
          id="btn-close-copilot"
          onClick={onClose}
          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 font-mono">Prompts:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium whitespace-nowrap border border-slate-700 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                m.sender === 'user' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none font-sans font-medium'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2 font-mono">
            <div className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Aegis Copilot evaluating context...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="input-copilot-prompt"
            type="text"
            placeholder="Ask Aegis Copilot about threats, IP containment..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            id="btn-copilot-send"
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
