import React from 'react';
import { OpenAIAggregatedChoice } from '../../types/api/openai';
import { BaseOpenAIResponseVisualizer } from '../base/OpenAIResponseVisualizerBase';

// Define interfaces
interface OpenAISSEResponseVisualizerProps {
  model?: string;
  created?: number;
  system_fingerprint?: string;
  eventCount?: number;
  usage?: any;
  choices?: OpenAIAggregatedChoice[];
}

// Main SSE visualizer component
const OpenAISSEResponseVisualizer: React.FC<OpenAISSEResponseVisualizerProps> = (obj) => {
  // Construct the response structure that matches the expected format
  const response = {
    id: undefined, // SSE responses may not have ID
    object: "chat.completion", // Set default object type
    created: obj.created,
    model: obj.model,
    system_fingerprint: obj.system_fingerprint,
    usage: obj.usage,
    choices: obj.choices
  };

  return (
    <BaseOpenAIResponseVisualizer
      response={response}
      eventCount={obj.eventCount}
      title="OpenAI SSE Response"
      subtitle="Server-Sent Events Response Visualization"
    />
  );
};

export default OpenAISSEResponseVisualizer;