import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

const DecisionNode: React.FC<NodeProps> = (props) => {
  return <BaseNode {...props} type="decision" />;
};

export default DecisionNode; 