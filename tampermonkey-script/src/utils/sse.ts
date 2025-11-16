import {
  OpenAISSEEvent,
  OpenAIChoice,
  OpenAIDelta,
  OpenAIToolCallDelta,
  OpenAIUsage,
  OpenAISSEResponseData,
  OpenAIAggregatedChoice,
  OpenAIAggregatedToolCall
} from '../types/api/openai';

// Using type aliases for backward compatibility
type Choice = OpenAIChoice;
type Delta = OpenAIDelta;
type ToolCallDelta = OpenAIToolCallDelta;
type Usage = OpenAIUsage;
type AggregatedChoice = OpenAIAggregatedChoice;
type AggregatedToolCall = OpenAIAggregatedToolCall;

export function processSSEEvents(events: OpenAISSEEvent[]): OpenAISSEResponseData {
  if (!events.length) {
    throw new Error("No events to process")
  }

  // Find the final event with metadata (usually the last one with usage info)
  const finalEvent = events.find((event) => event.usage) || events[events.length - 1]

  // Aggregate choices from all events
  const aggregatedChoices = aggregateChoices(events)

  return {
    id: finalEvent.id || "N/A",
    object: finalEvent.object || "N/A",
    created: finalEvent.created || 0,
    model: finalEvent.model || "N/A",
    system_fingerprint: finalEvent.system_fingerprint,
    choices: aggregatedChoices,
    usage: finalEvent.usage,
    eventCount: events.length,
  }
}

function aggregateChoices(events: OpenAISSEEvent[]): AggregatedChoice[] {
  // 结构: { [choice_index]: { ...choiceData, tool_calls: { [tool_index]: toolCallData } } }
  const choiceMap = new Map<number, {
    index: number
    role: string
    content: string
    reasoning_content: string
    tool_calls: Map<number, AggregatedToolCall>
    finish_reason: string
    logprobs?: any
  }>()

  for (const event of events) {
    if (!event.choices) continue
    for (const choice of event.choices) {
      const index = choice.index
      if (!choiceMap.has(index)) {
        choiceMap.set(index, {
          index,
          role: "N/A",
          content: "",
          reasoning_content: "",
          tool_calls: new Map<number, AggregatedToolCall>(),
          finish_reason: "N/A",
          logprobs: undefined,
        })
      }
      const agg = choiceMap.get(index)!
      const delta = choice.delta
      if (delta) {
        if (delta.role) agg.role = delta.role
        if (delta.content) agg.content += delta.content
        if (delta.reasoning_content) agg.reasoning_content += delta.reasoning_content
        if (delta.logprobs) agg.logprobs = delta.logprobs
        if (delta.tool_calls) {
          for (const toolCallDelta of delta.tool_calls) {
            const toolIndex = toolCallDelta.index
            if (!agg.tool_calls.has(toolIndex)) {
              agg.tool_calls.set(toolIndex, {
                index: toolIndex,
                id: "N/A",
                type: "N/A",
                function: { name: "N/A", arguments: "" },
              })
            }
            const toolCall = agg.tool_calls.get(toolIndex)!
            if (toolCallDelta.id) toolCall.id = toolCallDelta.id
            if (toolCallDelta.type) toolCall.type = toolCallDelta.type
            if (toolCallDelta.function?.name) toolCall.function.name = toolCallDelta.function.name
            if (toolCallDelta.function?.arguments) {
              toolCall.function.arguments += toolCallDelta.function.arguments
            }
          }
        }
      }
      if (choice.finish_reason) {
        agg.finish_reason = choice.finish_reason
      }
    }
  }
  // 转换为数组并排序
  return Array.from(choiceMap.values()).map(agg => ({
    index: agg.index,
    role: agg.role,
    content: agg.content,
    reasoning_content: agg.reasoning_content,
    tool_calls: Array.from(agg.tool_calls.values()).sort((a, b) => a.index - b.index),
    finish_reason: agg.finish_reason,
    logprobs: agg.logprobs,
  })).sort((a, b) => a.index - b.index)
}