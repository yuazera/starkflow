import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

const ProcessNode: React.FC<NodeProps> = (props) => {
  return <BaseNode {...props} type="process" />;
};

export default ProcessNode; 