# Components

This directory contains React visualizer components organized by API provider with shared base components.

## Structure

```
components/
├── common/                 # Shared components that are used across all APIs
├── base/                   # Base visualizer components that can be extended
│   ├── OpenAIResponseVisualizerBase.tsx # Base for OpenAI response rendering
│   └── BaseInfo.tsx        # General purpose info display components
├── openai/                 # OpenAI-specific visualizers
│   ├── OpenAIRequestVisualizer.tsx
│   ├── OpenAIResponseVisualizer.tsx
│   ├── OpenAISSEResponseVisualizer.tsx
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