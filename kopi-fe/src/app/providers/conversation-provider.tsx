'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useConversations } from '../hooks/useConversations';
import { Conversation, Message } from '../types/chat';

interface ConversationContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isHistoryLoading: boolean;
  isResponseLoading: boolean;
  isConversationsLoading: boolean;
  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation | null) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const conversationState = useConversations();

  return (
    <ConversationContext.Provider value={conversationState}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
} 