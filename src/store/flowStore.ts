import { create } from 'zustand';
import { BaseNode, Edge, FlowVersion } from '@/types/flow';
import { generateUniqueId } from '@/utils/helpers';

type UpdateFunction<T> = T | ((prev: T) => T);

interface FlowState {
  nodes: BaseNode[];
  edges: Edge[];
  selectedNode: BaseNode | null;
  highlightedNode: string | null;
  currentVersion: FlowVersion | null;
  
  // Actions
  setNodes: (nodes: UpdateFunction<BaseNode[]>) => void;
  setEdges: (edges: UpdateFunction<Edge[]>) => void;
  addNode: (node: Omit<BaseNode, 'id'>) => void;
  updateNode: (id: string, data: Partial<BaseNode>) => void;
  deleteNode: (id: string) => void;
  cloneNode: (id: string) => void;
  setHighlightedNode: (id: string | null) => void;
  setSelectedNode: (node: BaseNode | null) => void;
}

type SetState = (
  partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>),
  replace?: boolean
) => void;

export const useFlowStore = create<FlowState>((set: SetState) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  highlightedNode: null,
  currentVersion: null,

  setNodes: (nodes) => set((state) => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
  })),
  
  setEdges: (edges) => set((state) => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges
  })),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: generateUniqueId() }]
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...data } : node
    )
  })),
  
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => 
      edge.source !== id && edge.target !== id
    )
  })),
  
  cloneNode: (id) => set((state) => {
    const node = state.nodes.find((n) => n.id === id);
    if (!node) return state;
    
    const newNode = {
      ...node,
      id: generateUniqueId(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      }
    };
    
    return {
      nodes: [...state.nodes, newNode]
    };
  }),
  
  setHighlightedNode: (id) => set({ highlightedNode: id }),
  setSelectedNode: (node) => set({ selectedNode: node })
}));
