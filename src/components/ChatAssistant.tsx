import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  RotateCcw,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const N8N_CHAT_WEBHOOK_URL =
  'https://santhu86.app.n8n.cloud/webhook/bcf9ad9e-df4e-4d80-8939-38033541315a/chat';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatAssistantProps {
  fromPlace: string;
  toPlace: string;
  transportMode: string;
  departureDate: string;
  totalPriceFormatted: string;
}

function getOrCreateSessionId(): string {
  const storageKey = 'vayupath_n8n_chat_session_id';
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const generated = `vp-sess-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    sessionStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return `vp-sess-${Date.now()}`;
  }
}

function extractReplyFromN8nPayload(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const extracted = extractReplyFromN8nPayload(item);
      if (extracted) return extracted;
    }
    return null;
  }
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const candidateKeys = [
      'output',
      'text',
      'response',
      'message',
      'reply',
      'answer',
      'content',
      'data',
    ];
    for (const key of candidateKeys) {
      if (typeof obj[key] === 'string' && (obj[key] as string).trim()) {
        return (obj[key] as string).trim();
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nested = extractReplyFromN8nPayload(obj[key]);
        if (nested) return nested;
      }
    }
  }
  return null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  fromPlace,
  toPlace,
  transportMode,
  departureDate,
  totalPriceFormatted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'native' | 'embed'>('native');
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionId());
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: `Hello! I am your Vayupath Travel Chatbot connected to your n8n workflow. Ask me anything about your ${fromPlace} → ${toPlace} (${transportMode.toUpperCase()}) trip, seat berths, local cabs, or regional meals.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && viewMode === 'native') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, viewMode]);

  const handleResetSession = () => {
    const newId = `vp-sess-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    try {
      sessionStorage.setItem('vayupath_n8n_chat_session_id', newId);
    } catch {
      // ignore storage errors
    }
    setSessionId(newId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Started a fresh chat session. How can I help with your journey from ${fromPlace} to ${toPlace}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sendMessageToWebhook = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId,
          chatInput: trimmed,
          message: trimmed,
          metadata: {
            fromPlace,
            toPlace,
            transportMode,
            departureDate,
            estimatedTotal: totalPriceFormatted,
          },
        }),
      });

      const rawBody = await response.text();
      let parsedReply: string | null = null;

      try {
        const jsonData = JSON.parse(rawBody);
        parsedReply = extractReplyFromN8nPayload(jsonData);
      } catch {
        // If response is plain text (and not an HTML error page)
        if (rawBody && !rawBody.trim().startsWith('<!DOCTYPE') && !rawBody.trim().startsWith('<html')) {
          parsedReply = rawBody.trim();
        }
      }

      if (!response.ok) {
        throw new Error(
          parsedReply || `Webhook returned HTTP ${response.status}. Please verify the n8n workflow is active.`
        );
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text:
          parsedReply ||
          `Message received by n8n webhook for ${fromPlace} → ${toPlace}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMessage =
        err instanceof Error
          ? err.message
          : 'Could not reach the n8n chat webhook.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: `Unable to get a live reply from the n8n webhook (${errMessage}). You can also switch to "Hosted View" above if your n8n Chat node is set to Hosted mode.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageToWebhook(input);
  };

  const quickPrompts = [
    `Best ${transportMode} from ${fromPlace} to ${toPlace}?`,
    `Local cab & transit options in ${toPlace}`,
    `Regional food & meal boxes for ${toPlace}`,
  ];

  return (
    <div className="no-print fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[400px] max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-bold font-display tracking-tight truncate">
                Vayupath Travel Assistant
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {fromPlace} → {toPlace} · Live n8n Chat
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Switch between Native API Chat & Hosted n8n Embed */}
              <div className="flex items-center bg-slate-800 rounded-md p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setViewMode('native')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    viewMode === 'native'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('embed')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    viewMode === 'embed'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Hosted
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetSession}
                title="Reset Chat Session"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chatbot"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {viewMode === 'embed' ? (
            <div className="flex flex-col h-[440px] bg-slate-50">
              <iframe
                src={N8N_CHAT_WEBHOOK_URL}
                title="Vayupath n8n Hosted Chat"
                className="w-full flex-1 border-0"
                allow="microphone; clipboard-write"
              />
              <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Connected to n8n Cloud Webhook</span>
                <a
                  href={N8N_CHAT_WEBHOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 font-medium hover:underline"
                >
                  Open Full Tab
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Container */}
              <div className="h-[340px] overflow-y-auto p-4 space-y-3 bg-slate-50/70">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-700 text-white'
                          : msg.isError
                          ? 'bg-rose-50 border border-rose-200 text-rose-900'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
                      {msg.sender === 'user' ? 'You' : 'Assistant'} · {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                    <span>Waiting for n8n response...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Route Prompts */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSending}
                    onClick={() => sendMessageToWebhook(prompt)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${fromPlace} to ${toPlace}...`}
                  disabled={isSending}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  aria-label="Send message"
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2.5 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-lg transition-transform duration-150 active:scale-95 whitespace-nowrap"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            Close Travel Chat
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            Ask Travel Chatbot
          </>
        )}
      </button>
    </div>
  );
};
