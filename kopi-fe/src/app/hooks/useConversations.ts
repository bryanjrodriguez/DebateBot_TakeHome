import { useState, useCallback } from 'react';
import { Conversation, Message, ConversationHistory } from '../types/chat';
import { toast } from "sonner"

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setIsConversationsLoading(true);
      // This can have its own loader if needed in the future
      const response = await fetch('/api/v1/chat/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred', {
        style: {
          background: 'red',
          color: 'white',
        },
      });
    } finally {
      setIsConversationsLoading(false);
    }
  }, []);

  const fetchConversationHistory = useCallback(async (conversationId: string) => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch(`/api/v1/chat/history/${conversationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation history');
      }
      const data: ConversationHistory = await response.json();
      setMessages(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred', {
        style: {
          background: 'red',
          color: 'white',
        },
      });
      setMessages([]);
    } finally {
      setIsHistoryLoading(false);
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
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [selectedConversation]);

  const sendMessage = useCallback(async (message: string) => {
    const tempId = `temp-${Date.now()}`;
    const currentConversationId = selectedConversation?.conversation_id;

    if (!currentConversationId) {
      const tempConversation: Conversation = {
        conversation_id: tempId,
        topic: "New Debate",
        created_at: new Date().toISOString()
      };
      setConversations(prev => [...prev, tempConversation]);
      setSelectedConversation(tempConversation);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversationId || tempId,
      message: message.trim(),
      role: 'user' as const,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsResponseLoading(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          message: message.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data = await response.json();
      
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
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred', {
        style: {
          background: 'red',
          color: 'white',
        },
      });
      if (!currentConversationId) {
        setConversations(prev => prev.filter(c => c.conversation_id !== tempId));
        setSelectedConversation(null);
        setMessages([]);
      }
    } finally {
      setIsResponseLoading(false);
    }
  }, [selectedConversation]);

  const createConversation = useCallback(async (topic: string) => {
    try {
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
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred', {
        style: {
          background: 'red',
          color: 'white',
        },
      });
      throw err;
    }
  }, []);

  return {
    conversations,
    selectedConversation,
    messages,
    isHistoryLoading,
    isResponseLoading,
    isConversationsLoading,
    fetchConversations,
    selectConversation,
    deleteConversation,
    createConversation,
    sendMessage,
    setMessages,
    setConversations,
    setSelectedConversation,
  };
} 