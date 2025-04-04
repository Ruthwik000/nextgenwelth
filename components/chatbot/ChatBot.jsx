"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ChatBot({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {isOpen ? (
        <div 
          className="bg-black/90 backdrop-blur-lg border border-white/10 w-full h-full flex flex-col pointer-events-auto"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-medium">Financial Assistant</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-cyan-400"
                >
                  Clear Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-cyan-400"
                >
                  Export Chat
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-cyan-400"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
ai 
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-4",
                  msg.type === 'user' ? 'justify-end space-x-reverse' : 'justify-start'
                )}
              >
                {msg.type === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-cyan-500" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-6 py-4 max-w-[70%] leading-7 shadow-md",
                    msg.type === 'user'
                      ? 'bg-cyan-500 text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">You</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-6 py-4 text-white/90 shadow-md">
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce delay-100"></div>
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}