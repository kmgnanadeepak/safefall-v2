import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const EXAMPLE_QUESTIONS = [
  'How many falls occurred this week?',
  'Why was this event marked emergency?',
  'What is my last fall?',
  'Emergency status?',
];

export default function AnalyticsChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim()) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const { data } = await api.post('/patient/analytics/chat', { question: q });
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, could not process your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analysis & Insights</h1>
      <p className="text-gray-400 text-sm">
        Ask questions about your fall and emergency data. Example: &quot;How many falls occurred this week?&quot;
      </p>

      <div className="glass-card flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="mb-4">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="px-3 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/10'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-white/10 animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="p-4 border-t border-white/10"
        >
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Ask about your fall data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="btn-primary">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
