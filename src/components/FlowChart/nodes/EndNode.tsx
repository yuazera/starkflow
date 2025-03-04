import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

const EndNode: React.FC<NodeProps> = (props) => {
  return <BaseNode {...props} type="end" />;
};

export default EndNode; 