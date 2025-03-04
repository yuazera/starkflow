export type NodeType = 'start' | 'end' | 'process' | 'decision';

export interface BaseNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    attributes: {
      [key: string]: string;
    }
  }
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

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

export interface TemplateQuestion {
  id: string;
  nodeType: NodeType;
  questions: string[];
} 