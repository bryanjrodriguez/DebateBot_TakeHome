'use client';
import { memo, useCallback, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import { useConversationContext } from '../providers/conversation-provider';
import type { Conversation } from '../types/chat';
import TypingIndicator from './TypingIndicator';

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
    isHistoryLoading,
    isResponseLoading,
    sendMessage,
  } = useConversationContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (message: string, images?: File[]) => {
    if (!message.trim() && (!images || images.length === 0)) return;
    await sendMessage(message);
  }, [sendMessage]);

  if (!selectedConversation) {
    return (
      <div className="flex h-full w-full flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:-mt-36">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">
            What do you want to debate today?
          </h1>
          <div className="w-full max-w-2xl px-4">
            <MemoChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isResponseLoading} 
              placeholder="Type your debate topic here..."
            />
          </div>
        </div>
      </div>
    );
  }

  if (isHistoryLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background">
        <TypingIndicator />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages?.map((msg) =>
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

        {isResponseLoading && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl px-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <MemoChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isResponseLoading} 
        placeholder="Type your message here..."
      />
    </div>
  );
}
