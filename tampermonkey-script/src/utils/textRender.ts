// Helper function to safely format text with HTML, preserving whitespace and line breaks
export function formatTextWithLineBreaks(content: string): string {
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
