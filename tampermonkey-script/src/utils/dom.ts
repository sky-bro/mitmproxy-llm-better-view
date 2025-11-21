// DOM utility functions

export function createReactContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  return container;
}

export async function createDirectElement(html: string) {
  // Get the container element
  let container = document.getElementById('mitmproxy-llm-better-view-container') as HTMLElement | null;
  if (!container) {
    const contentview = document.querySelector('.contentview');
    if (!contentview) {
      console.warn("no `.contentview` element found");
      return;
    }

    const secondChild = contentview.childNodes[1];
    container = document.createElement('details');
    container.toggleAttribute('open');
    container.id = 'mitmproxy-llm-better-view-container';
    container.classList.add('llm-better-view');
    contentview.insertBefore(container, secondChild);
  }

  // Ensure the details element has a summary element
  let summaryElement = Array.from(container.children).find(
    el => el.tagName.toLowerCase() === 'summary'
  ) as HTMLElement | undefined;
  if (!summaryElement) {
    summaryElement = document.createElement('summary');
    summaryElement.textContent = 'LLM Better View'; // You might want to customize this text
    container.prepend(summaryElement); // Add it as the first child
  }

  // Clear existing content and insert new content directly
  const childrenToKeep = Array.from(container.children).filter(
    el => el.tagName.toLowerCase() === 'summary'
  );
  container.innerHTML = '';
  childrenToKeep.forEach(child => container.appendChild(child)); // Add summary back

  // Parse the HTML string and add it to the container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html.trim();

  // Move all children from tempDiv to container
  while (tempDiv.firstChild) {
    container.appendChild(tempDiv.firstChild);
  }
}