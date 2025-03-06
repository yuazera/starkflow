export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant';
}

export interface ChatHistory {
  flowId: string;
  nodeId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
