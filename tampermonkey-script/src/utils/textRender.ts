// Helper function to safely format text with HTML, preserving whitespace and line breaks
function formatTextWithLineBreaks(content: string): string {
  if (!content) return '';
  return `<pre class="text-content" style="white-space: pre-wrap; margin: 0;">${content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</pre>`;
}

export function renderChoiceTextContent(content: string): string {
  // This function would handle rendering markdown or formatted content
  // For simplicity, we'll return the content as-is, but in a real implementation,
  // you might want to add markdown processing here

  // Simple approach to ensure basic line break handling
  return formatTextWithLineBreaks(content);
}

export function renderToolMessage(content: any): string {
  if (typeof content === 'string') {
    return formatTextWithLineBreaks(content);
  } else if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') {
        return formatTextWithLineBreaks(item);
      } else if (item.type === 'text') {
        return formatTextWithLineBreaks(item.text || '');
      } else {
        return JSON.stringify(item, null, 2);
      }
    }).join('<br>');
  } else {
    return JSON.stringify(content, null, 2);
  }
}

export function renderToolChoiceArgument(args: any): string {
  if (typeof args === 'object' && args !== null) {
    return `<pre style="white-space: pre; font-family: monospace;">${JSON.stringify(args, null, 2)}</pre>`;
  }

  const argString = String(args);
  return formatTextWithLineBreaks(argString);
}

export function isAnthropicContent(content: any): boolean {
  return content && typeof content === 'object' && typeof content.type === 'string';
}