import React from 'react';
import { OpenAIResponse } from '../../types/api/openai';
import { BaseOpenAIResponseVisualizer } from '../base/OpenAIResponseVisualizerBase';

interface OpenAIResponseVisualizerProps {
  response: OpenAIResponse;
}

const OpenAIResponseVisualizer: React.FC<OpenAIResponseVisualizerProps> = ({ response }) => {
  return (
    <BaseOpenAIResponseVisualizer response={response} title="OpenAI API Response" />
  );
};

export default OpenAIResponseVisualizer;