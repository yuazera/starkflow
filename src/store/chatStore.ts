import { create } from 'zustand';
import { ChatMessage, ChatHistory } from '@/types/chat';
import { generateUniqueId } from '@/utils/helpers';

interface ChatState {
  history: ChatHistory | null;
  messages: ChatMessage[];
  currentContext: {
    flowId: string;
    nodeId?: string;
  };
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setContext: (flowId: string, nodeId?: string) => void;
  clearHistory: () => void;
  saveProgress: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  history: null,
  messages: [],
  currentContext: {
    flowId: '',
  },
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: generateUniqueId(),
      timestamp: new Date()
    }]
  })),
  
  setContext: (flowId, nodeId) => set({
    currentContext: { flowId, nodeId }
  }),
  
  clearHistory: () => set({
    messages: [],
    currentContext: { flowId: '' }
  }),
  
  saveProgress: async () => {
    // TODO: Implement save to server
    console.log('Saving progress...');
  }
})); 