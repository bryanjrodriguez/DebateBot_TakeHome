'use client';
import { memo, useCallback, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import { useConversationContext } from '../providers/conversation-provider';
import type { Conversation } from '../types/chat';

const MemoChatInput = memo(ChatInput);

const formatMessageWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function ChatWindow() {
  const { 
    messages, 
    selectedConversation, 
    isLoading, 
    setMessages,
    setConversations,
    setSelectedConversation
  } = useConversationContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (message: string, images?: File[]) => {
    if (!message.trim() && (!images || images.length === 0)) return;

    const tempId = `temp-${Date.now()}`;
    const currentConversationId = selectedConversation?.conversation_id;
    
    // Only create a temporary conversation if we don't have a real one
    if (!currentConversationId) {
      const tempConversation: Conversation = {
        conversation_id: tempId,
        topic: "New Debate",
        created_at: new Date().toISOString()
      };
      setConversations(prev => [...prev, tempConversation]);
      setSelectedConversation(tempConversation);
    }
    
    const userMessage = {
      id: Date.now().toString(),
      conversation_id: currentConversationId || tempId,
      message: message.trim(),
      role: 'user' as const,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: currentConversationId || null,
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Only handle conversation creation if we didn't have one before
      if (!currentConversationId) {
        const realConversation = {
          conversation_id: data.conversation_id,
          topic: "New Debate", 
          created_at: new Date().toISOString()
        };
        
        setConversations((prev: Conversation[]) => {
          const filtered = prev.filter(c => c.conversation_id !== tempId);
          return [...filtered, realConversation];
        });

        
        const botResponse = data.message[0];
        if (botResponse && botResponse.role === 'bot') {
          setMessages([
            {
              id: Date.now().toString(),
              conversation_id: data.conversation_id,
              message: userMessage.message,
              role: 'user',
              created_at: userMessage.created_at
            },
            {
              id: (Date.now() + 1).toString(),
              conversation_id: data.conversation_id,
              message: botResponse.message,
              role: botResponse.role,
              created_at: new Date().toISOString()
            }
          ]);
        }
        
        setSelectedConversation(realConversation);
      } else {
        const botResponse = data.message[0];
        if (botResponse && botResponse.role === 'bot') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            conversation_id: data.conversation_id,
            message: botResponse.message,
            role: botResponse.role,
            created_at: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // TODO: Show error to user
      

      if (!currentConversationId) {
        setConversations(prev => prev.filter(c => c.conversation_id !== tempId));
        setSelectedConversation(null);
        setMessages([]);
      }
    }
  }, [selectedConversation, setConversations, setSelectedConversation, setMessages]);

  if (!selectedConversation) {
    return (
      <div className="flex h-full w-full flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 -mt-36">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">
            What do you want to debate today?
          </h1>
          <div className="w-full max-w-2xl px-4">
            <MemoChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading} 
              placeholder="Type your debate topic here..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="w-full flex justify-center">
              <div className="w-full max-w-3xl px-4 flex justify-end">
                <div className="bg-[#EBF1FF] dark:bg-[#1E293B] text-zinc-800 dark:text-zinc-200 rounded-lg p-4 space-y-3 leading-relaxed">
                  <p className="whitespace-pre-wrap text-sm">{formatMessageWithBold(msg.message)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="w-full flex justify-center">
              <div className="w-full max-w-3xl px-4 space-y-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {formatMessageWithBold(msg.message)}
                </p>
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl px-4">
              <p className="text-sm text-muted-foreground">Typing…</p>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <MemoChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading} 
        placeholder="Type your message here..."
      />
    </div>
  );
}
