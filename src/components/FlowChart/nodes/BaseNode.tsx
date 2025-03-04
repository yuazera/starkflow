import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from 'antd';
import { useFlowStore } from '@/store/flowStore';

interface BaseNodeProps extends NodeProps {
  data: {
    label: string;
    attributes: Record<string, string>;
  };
  type: 'start' | 'end' | 'process' | 'decision';
}

const BaseNode: React.FC<BaseNodeProps> = ({ id, data, type }) => {
  const { highlightedNode } = useFlowStore();
  const isHighlighted = highlightedNode === id;

  return (
    <Card
      size="small"
      className={`w-40 ${isHighlighted ? 'border-blue-500 border-2' : ''}`}
      style={{ background: type === 'decision' ? '#fff3e0' : '#ffffff' }}
    >
      <div className="text-center">
        <div className="font-bold">{data.label}</div>
        {Object.entries(data.attributes).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500">
            {key}: {value}
          </div>
        ))}
      </div>
      {type !== 'start' && (
        <Handle type="target" position={Position.Top} />
      )}
      {type !== 'end' && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </Card>
  );
};

export default BaseNode; 