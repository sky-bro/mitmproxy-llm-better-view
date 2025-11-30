# Components

This directory contains React visualizer components organized by API provider with shared common components.

## Structure

```
components/
├── common/                 # Shared components that are used across all APIs
│   ├── BasicInfo.tsx       # General purpose info display component
│   ├── InfoItem.tsx        # Individual info item component
│   ├── JsonContent.tsx     # JSON content display component
│   ├── Message.tsx         # Message display component
│   ├── MessageContentBlock.tsx  # Message content block component
│   ├── Messages.tsx        # Messages container component
│   ├── ProseContent.tsx    # Prose content display component
│   ├── Section.tsx         # Section wrapper component
│   ├── Tool.tsx            # Tool display component
│   ├── ToolCall.tsx        # Tool call display component
│   ├── ToolResult.tsx      # Tool result display component
│   └── UsageItem.tsx       # Usage item display component
├── openai/                 # OpenAI-specific visualizers
│   ├── OpenAIRequestVisualizer.tsx
│   ├── OpenAIResponseVisualizer.tsx
│   └── index.ts            # Export for OpenAI visualizers
├── anthropic/              # Anthropic-specific visualizers
│   ├── AnthropicRequestVisualizer.tsx
│   ├── AnthropicResponseVisualizer.tsx
│   └── index.ts            # Export for Anthropic visualizers
├── index.ts                # Main export file for all visualizers
└── README.md               # This file
```

## Usage

To import all visualizers:

```typescript
import {
  OpenAIRequestVisualizer,
  OpenAIResponseVisualizer,
  AnthropicRequestVisualizer,
  AnthropicResponseVisualizer
} from './components/';
```

To import specific API visualizers:

```typescript
import { OpenAIRequestVisualizer } from './components/openai/';
import { AnthropicRequestVisualizer } from './components/anthropic/';
```

## Adding New API Support

To add support for a new API provider:

1. Create a new directory under `components/` named after the API provider
2. Add request/response visualizers following the existing patterns
3. Add an index.ts export file for the new provider
4. Update the main `index.ts` to export the new visualizers