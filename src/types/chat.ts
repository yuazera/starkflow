export interface QuickReply {
  id: string;
  text: string;
  value: string;
  type?: 'attribute' | 'confirmation' | 'action';
  metadata?: {
    nodeId?: string;
    attributeKey?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  relatedNodeId?: string;
  intent?: {
    type: 'attribute_update' | 'node_add' | 'node_delete' | 'flow_validation';
    nodeId?: string;
    attributeKey?: string;
    value?: string;
  };
  context?: {
    flowValidation?: {
      isValid: boolean;
      errors: string[];
    };
    suggestedActions?: string[];
  };
}

export interface ChatHistory {
  id: string;
  flowId: string;
  messages: ChatMessage[];
  currentNode?: string;
  validationState: {
    completedNodes: string[];
    validatedAttributes: {
      [nodeId: string]: string[];
    };
    pendingIssues: {
      nodeId: string;
      type: 'missing_attribute' | 'invalid_connection' | 'validation_failed';
      message: string;
    }[];
  };
}

export interface ChatContext {
  flowId: string;
  currentNode?: {
    id: string;
    type: string;
  };
  history: ChatMessage[];
  scenario?: {
    id: string;
    description: string;
    variables: { [key: string]: string };
  };
  contextualHelp?: {
    suggestedQuestions: string[];
    relevantAttributes: string[];
    validationTips: string[];
  };
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  variables: {
    key: string;
    description: string;
    type: 'text' | 'number' | 'date';
    defaultValue?: string;
  }[];
  questions: string[];
}
