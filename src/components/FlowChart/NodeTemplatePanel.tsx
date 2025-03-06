import React from 'react';
import React from 'react';
import { NodeTemplate } from '@/types/flow';

interface NodeTemplatePanelProps {
  templates: NodeTemplate[];
  selectedTemplate: NodeTemplate | null;
  onSelectTemplate: (template: NodeTemplate | null) => void;
  isAdmin?: boolean;
}

export const NodeTemplatePanel: React.FC<NodeTemplatePanelProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  isAdmin = false,
}) => {
  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', template.type);
    onSelectTemplate(template);
  };

  const onDragEnd = () => {
    onSelectTemplate(null);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">流程节点</h3>
      <div className="space-y-2">
        {templates
          .filter(template => isAdmin || template.isEditable)
          .map(template => (
            <div
              key={template.type}
              className={`
                p-3 border rounded cursor-move
                ${selectedTemplate?.type === template.type ? 'border-blue-500' : 'border-gray-200'}
                hover:border-blue-300 transition-colors
              `}
              draggable
              onDragStart={e => onDragStart(e, template)}
              onDragEnd={onDragEnd}
            >
              <div className="font-medium">{template.label}</div>
              <div className="text-sm text-gray-500">{template.description}</div>
            </div>
          ))}
      </div>
    </aside>
  );
};

export default NodeTemplatePanel;
