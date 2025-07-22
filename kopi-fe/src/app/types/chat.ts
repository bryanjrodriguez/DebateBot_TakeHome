export interface Conversation {
  conversation_id: string;
  topic: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  message: string;
  role: 'user' | 'bot';
  created_at: string;
}

export interface ConversationHistory {
  conversation_id: string;
  message: Message[];
} 