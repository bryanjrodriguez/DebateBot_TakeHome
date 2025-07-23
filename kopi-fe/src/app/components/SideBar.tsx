'use client';
import { useEffect } from 'react';
import {
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useConversationContext } from '../providers/conversation-provider';
import type { Conversation } from '../types/chat';
import SidebarItem from './SideBarItem';
import { Loader2 } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const {
    conversations,
    selectedConversation,
    isConversationsLoading,
    fetchConversations,
    selectConversation,
    deleteConversation,
  } = useConversationContext();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = () => {
    selectConversation(null);
    onClose?.();
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSelectChat = async (conversation: Conversation) => {
    try {
      await selectConversation(conversation);
      onClose?.();
    } catch (err) {
      console.error('Failed to select chat:', err);
    }
  };

  return (
    <div className="w-48 lg:w-64 h-full bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-3 border-b border-sidebar-border font-semibold flex items-center justify-between">
        <span>Kopi Debate</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onClose}
            className="sm:hidden p-2 hover:bg-sidebar-accent rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 border-b border-sidebar-border p-2 text-sm">
        <SidebarItem icon={Plus} label="New chat" onClick={handleNewChat} />
      </div>

      <div className="text-xs uppercase text-sidebar-accent-foreground px-3 pt-4 pb-2 flex items-center gap-2">
        <span>Debates</span>
        {isConversationsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      
      <div className="flex-1 overflow-y-auto text-sm">
        {conversations.map((conversation) => (
          <div
            key={conversation.conversation_id}
            onClick={() => handleSelectChat(conversation)}
            className={`px-3 py-2 text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer truncate group flex items-center justify-between ${
              selectedConversation?.conversation_id === conversation.conversation_id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
            }`}
          >
            <span className="truncate">{conversation.topic}</span>
            <button
              onClick={(e) => handleDeleteChat(conversation.conversation_id, e)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

