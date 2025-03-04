export interface QuickReply {
  id: string;
  text: string;
  value: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  relatedNodeId?: string;
}

export interface ChatHistory {
  id: string;
  flowId: string;
  messages: ChatMessage[];
  currentNode?: string;
}

export interface ChatContext {
  flowId: string;
  currentNode?: {
    id: string;
    type: string;
  };
  history: ChatMessage[];
} 