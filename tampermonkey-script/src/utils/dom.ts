// DOM utility functions

export function getOrCreateRenderTarget(): HTMLElement {
  let outerContainer = document.getElementById('mitmproxy-llm-better-view-container');

  if (!outerContainer || !document.contains(outerContainer)) {
    const contentview = document.querySelector('.contentview');
    if (!contentview) {
      throw new Error("no `.contentview` element found");
    }
    outerContainer = document.createElement('details');
    outerContainer.toggleAttribute('open');
    outerContainer.id = 'mitmproxy-llm-better-view-container';
    outerContainer.classList.add('llm-better-view');
    contentview.insertBefore(outerContainer, contentview.childNodes[1]);
  }

  if (!outerContainer.querySelector('summary')) {
    const summary = document.createElement('summary');
    summary.textContent = 'LLM Better View';
    outerContainer.prepend(summary);
  }

  let reactMount = outerContainer.querySelector<HTMLElement>('#llm-react-root');
  if (!reactMount) {
    reactMount = document.createElement('div');
    reactMount.id = 'llm-react-root';
    outerContainer.appendChild(reactMount);
  }

  return reactMount;
}
