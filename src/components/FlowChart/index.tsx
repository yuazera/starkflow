import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Connection,
  addEdge,
  useReactFlow,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node as ReactFlowNode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFlowStore } from '@/store/flowStore';
import { NodeTemplate, NodeType, FlowValidation, BaseNode, Edge, NodeData } from '@/types/flow';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import ProcessNode from './nodes/ProcessNode';
import DecisionNode from './nodes/DecisionNode';
import NodeTemplatePanel from './NodeTemplatePanel';

interface FlowChartProps {
  templates: NodeTemplate[];
  validation: FlowValidation;
  isAdmin?: boolean;
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
};

const FlowChart: React.FC<FlowChartProps> = ({
  templates,
  validation,
  isAdmin = false,
}) => {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  const { project } = useReactFlow();

  const canAddNode = useCallback(
    (type: NodeType) => {
      if (!isAdmin && !templates.find(t => t.type === type)) {
        return false;
      }

      const typeCount = nodes.filter(n => n.type === type).length;
      const maxAllowed = validation.maxNodes;

      if (maxAllowed && typeCount >= maxAllowed) {
        return false;
      }

      return true;
    },
    [nodes, templates, validation, isAdmin]
  );

  const canConnect = useCallback(
    (source: BaseNode, target: BaseNode) => {
      const sourceType = source.type as NodeType;
      const targetType = target.type as NodeType;

      const rules = validation.connectionRules[sourceType];
      if (!rules) return false;

      if (!rules.allowed.includes(targetType)) {
        return false;
      }

      const sourceConnections = edges.filter(e => e.source === source.id);
      if (rules.max && sourceConnections.length >= rules.max) {
        return false;
      }

      return true;
    },
    [edges, validation.connectionRules]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const allowedChanges = changes.filter(change => {
        if (change.type === 'remove') {
          const node = nodes.find(n => n.id === change.id);
          if (!node) return false;
          return isAdmin || !node.data.isLocked;
        }
        return true;
      });
      setNodes((nodes) => applyNodeChanges(allowedChanges, nodes) as BaseNode[]);
    },
    [nodes, setNodes, isAdmin]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const allowedChanges = changes.filter(change => {
        if (change.type === 'remove') {
          const edge = edges.find(e => e.id === change.id);
          if (!edge) return false;
          const sourceNode = nodes.find(n => n.id === edge.source);
          return isAdmin || !(sourceNode?.data.isLocked);
        }
        return true;
      });
      setEdges((edges) => applyEdgeChanges(allowedChanges, edges) as Edge[]);
    },
    [edges, nodes, setEdges, isAdmin]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode || !canConnect(sourceNode, targetNode)) {
        return;
      }

      const newEdge: Edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || null,
        targetHandle: connection.targetHandle || null,
      };
      
      setEdges((edges) => addEdge(newEdge, edges) as Edge[]);
    },
    [setEdges, nodes, canConnect]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!selectedTemplate) return;

      const type = selectedTemplate.type;
      if (!canAddNode(type)) return;

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: BaseNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: selectedTemplate.label,
          attributes: {},
          template: selectedTemplate.label,
          isLocked: !isAdmin,
        },
      };

      setNodes((nodes) => [...nodes, newNode]);
      setSelectedTemplate(null);
    },
    [project, selectedTemplate, canAddNode, setNodes, isAdmin]
  );

  return (
    <div className="h-full w-full flex">
      <NodeTemplatePanel
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        isAdmin={isAdmin}
      />
      <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowChart;
