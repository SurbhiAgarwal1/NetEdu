// src/components/ai/AIChatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const PREDEFINED_RESPONSES: Record<string, string> = {
  'hello': 'Hi! I\'m your NetEdu assistant. I can help you with speed tests, courses, and understanding how your network affects learning. What would you like to know?',
  'hi': 'Hello! How can I help you today?',
  'speed test': 'To run a speed test, go to the Network page and click "Start Test". It will measure your download speed, upload speed, and latency. This helps us recommend the right content for your connection!',
  'slow internet': 'If you have slow internet, NetEdu will automatically recommend text-based lessons instead of videos. You can also download lessons when your connection is better and study offline!',
  'courses': 'Check out the Learning page to browse available courses. We have courses on Python, Web Development, Data Science, and more. Each course adapts to your network speed!',
  'offline': 'Yes! You can download lessons when you have good internet and study them offline later. Just look for the download icon next to each lesson.',
  'help': 'I can help you with:\n- Running speed tests\n- Understanding your network quality\n- Finding courses\n- Learning offline\n- Understanding how connectivity affects learning\n\nWhat would you like to know?',
  'correlation': 'NetEdu tracks how your network quality affects your learning. We use statistical analysis to show you patterns - like "you complete 40% more lessons on days with better internet". Check your Dashboard for insights!',
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi! I\'m your NetEdu assistant. Ask me anything about speed tests, courses, or how to learn with slow internet!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for keywords
    for (const [keyword, response] of Object.entries(PREDEFINED_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Default responses
    if (lowerMessage.includes('?')) {
      return 'That\'s a great question! For detailed help, check out our documentation or try asking about: speed tests, courses, offline learning, or network correlation.';
    }

    return 'I\'m not sure about that, but I can help you with speed tests, finding courses, learning offline, and understanding how your network affects learning. What would you like to know?';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            zIndex: 999,
          }}
          title="Chat with AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card fade-in"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            zIndex: 999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))',
              color: 'white',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.95rem' }}>NetEdu Assistant</div>
                <div style={{ fontSize: '.75rem', opacity: 0.9 }}>Always here to help</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '.25rem',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '.75rem',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '.5rem',
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: msg.sender === 'bot' ? 'var(--brand-100)' : 'var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {msg.sender === 'bot' ? <Bot size={16} color="var(--brand-600)" /> : <User size={16} color="var(--gray-600)" />}
                </div>
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: msg.sender === 'bot' ? 'var(--gray-100)' : 'var(--brand-500)',
                    color: msg.sender === 'bot' ? 'var(--text)' : 'white',
                    fontSize: '.875rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--brand-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={16} color="var(--brand-600)" />
                </div>
                <div
                  style={{
                    padding: '.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--gray-100)',
                  }}
                >
                  <div className="pulse" style={{ display: 'flex', gap: '.25rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="form-input"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button
              onClick={handleSend}
              className="btn btn-primary"
              disabled={!input.trim()}
              style={{ padding: '.6rem 1rem' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
