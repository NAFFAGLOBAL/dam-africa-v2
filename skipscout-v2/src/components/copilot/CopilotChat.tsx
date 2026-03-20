'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { ToolIndicator } from './ToolIndicator';
import { Send, Loader2, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentHistory {
  role: string;
  content: unknown;
}

export function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentHistory, setAgentHistory] = useState<AgentHistory[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTool, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setActiveTool('check_user_credits');

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: agentHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
      setAgentHistory(data.history || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an error: ${msg}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setActiveTool(null);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setAgentHistory([]);
    setError(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Copilot</h2>
          <p className="text-xs text-slate-500">
            Powered by Claude + Versium REACH
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 py-20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900">
                Welcome to SkipScout AI
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Skip trace people, look up properties, build lead lists, and
                more. What can I help you with?
              </p>
            </div>
            <QuickActions onSelect={sendMessage} disabled={isLoading} />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && activeTool && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
                <ToolIndicator toolName={activeTool} />
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Quick actions below messages */}
      {messages.length > 0 && !isLoading && (
        <div className="border-t px-4 py-2">
          <QuickActions onSelect={sendMessage} disabled={isLoading} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything — skip trace, property lookup, lead lists..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
