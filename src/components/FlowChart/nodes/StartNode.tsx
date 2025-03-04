import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

const StartNode: React.FC<NodeProps> = (props) => {
  return <BaseNode {...props} type="start" />;
};

export default StartNode; 