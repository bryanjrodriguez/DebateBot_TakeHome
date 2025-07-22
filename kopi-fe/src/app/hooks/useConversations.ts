import { useState, useCallback } from 'react';
import { Conversation, Message, ConversationHistory } from '../types/chat';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/v1/chat/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConversationHistory = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/v1/chat/history/${conversationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation history');
      }
      const data: ConversationHistory = await response.json();
      setMessages(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback(async (conversation: Conversation | null) => {
    setSelectedConversation(conversation);
    if (conversation) {
      
      if (!conversation.conversation_id.startsWith('temp-')) {
        await fetchConversationHistory(conversation.conversation_id);
      } else {
        setMessages([]); 
      }
    } else {
      setMessages([]);
    }
  }, [fetchConversationHistory]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/v1/chat/${conversationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      setConversations((prev) => 
        prev.filter((c) => c.conversation_id !== conversationId)
      );

      
      if (selectedConversation?.conversation_id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [selectedConversation]);

  const createConversation = useCallback(async (topic: string) => {
    try {
      setError(null);
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const newConversation = await response.json();
      setConversations((prev) => [...prev, newConversation]);
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    error,
    fetchConversations,
    selectConversation,
    deleteConversation,
    createConversation,
    setMessages,
    setConversations,
    setSelectedConversation,
  };
} 