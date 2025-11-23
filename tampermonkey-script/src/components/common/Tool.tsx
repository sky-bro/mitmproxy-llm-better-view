import React, { useState } from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';

export interface ToolDefinition {
  name?: string;
  description?: string;
  input_schema?: {
    type?: string;
    properties?: { [key: string]: any } | unknown | null;
    required?: string[] | null;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties for flexibility
}

// Component to render parameter items
const ParameterItem: React.FC<{ name: string; param: any; required: string[] }> = ({ name, param, required }) => {
  const isRequired = required.includes(name);
  return (
    <div className="parameter-item">
      <div>
        <span className="parameter-name">{name}</span>
        {param.type && <span className="parameter-type">{param.type}</span>}
        {isRequired && <span className="parameter-required">required</span>}
      </div>
      {param.description && (
        <div className="parameter-description">{param.description}</div>
      )}
    </div>
  );
};

// Component to render tool content based on the tool structure
const ToolContent: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  return (
    <>
      {tool.description && (
        <div
          className="tool-description prose"
          dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(tool.description) }}
        />
      )}
      {tool.input_schema?.properties && (
        <div className="tool-parameters">
          <div className="tool-parameters-title">parameters:</div>
          {Object.entries(
            tool.input_schema.properties as { [key: string]: any }
          ).map(([name, param]) => (
            <ParameterItem
              key={name}
              name={name}
              param={param}
              required={tool.input_schema?.required || []}
            />
          ))}
        </div>
      )}
    </>
  );
};

interface SharedToolProps {
  tool: ToolDefinition;
  index: number;
  isOpenByDefault?: boolean; // Whether the tool item should be open by default. Only applies to single Tool component, not the Tools collection.
}

// Shared component to render a single tool
export const Tool: React.FC<SharedToolProps> = ({ tool, index, isOpenByDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);

  return (
    <details open={isOpen} className="tool-item" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="tool-header">
        <div className="flex-container">
          <span className="tool-name-badge">{tool.name || `Tool ${index + 1}`}</span>
          <span className="text-small">#{index + 1}</span>
        </div>
      </summary>
      <div className="tool-content">
        <ToolContent tool={tool} />
      </div>
    </details>
  );
};

interface ToolsProps {
  title?: string;
  defaultOpen?: boolean; // Whether the collection should be open by default
  children?: React.ReactNode;
}

// Collection component to render multiple tools
export const Tools: React.FC<ToolsProps> = ({
  title = "Tools",
  defaultOpen = false,
  children
}) => {
  if (!children) return null;

  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          {title}
        </span>
      </summary>
      <div className="section-content">
        {children}
      </div>
    </details>
  );
};

export default Tools;