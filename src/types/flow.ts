import { Node, Edge as ReactFlowEdge } from 'reactflow';

export type NodeType = 'start' | 'end' | 'process' | 'decision';

export interface NodeAttribute {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  attributes: NodeAttribute[];
  isEditable: boolean;
}

export interface NodeData {
  label: string;
  attributes: {
    [key: string]: string;
  };
  template?: string;
  isLocked?: boolean;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canChangeAttributes: boolean;
  };
}

export type BaseNode = Node<NodeData>;

export interface EdgeData {
  label?: string;
  isLocked?: boolean;
}

export type Edge = ReactFlowEdge<EdgeData>;

export interface FlowVersion {
  id: string;
  version: string;
  createdAt: Date;
  nodes: BaseNode[];
  edges: Edge[];
  createdBy: string;
}

export interface ExcelTemplate {
  headers: string[];
  mapping: {
    [key: string]: string;
  };
}

export interface DialogueGuide {
  nodeType: NodeType;
  contextQuestions: string[];
  attributePrompts: {
    [key: string]: string[];
  };
  validationRules: {
    [key: string]: {
      rule: string;
      message: string;
    }[];
  };
}

export interface FlowValidation {
  requiredNodes: NodeType[];
  maxNodes?: number;
  connectionRules: {
    [key in NodeType]?: {
      allowed: NodeType[];
      max?: number;
    };
  };
}
