import { broker, isBrokeredProtocol } from './broker';

type UrlElement = HTMLAnchorElement | HTMLAreaElement | HTMLIFrameElement;

function rewriteElement(element: UrlElement): void {
  const attribute = element instanceof HTMLIFrameElement ? 'src' : 'href';
  const raw = element.getAttribute(attribute);
  if (!raw || !isBrokeredProtocol(raw)) return;
  const replacement = broker(raw);
  if (replacement) element.setAttribute(attribute, replacement);
}

function rewriteTree(root: ParentNode): void {
  if (root instanceof HTMLAnchorElement || root instanceof HTMLAreaElement || root instanceof HTMLIFrameElement) rewriteElement(root);
  root.querySelectorAll<HTMLAnchorElement | HTMLAreaElement | HTMLIFrameElement>('a[href], area[href], iframe[src]').forEach(rewriteElement);
}

function patchUrlProperty(prototype: object, property: 'href' | 'src'): void {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
  if (!descriptor?.get || !descriptor.set || descriptor.configurable === false) return;
  Object.defineProperty(prototype, property, {
    ...descriptor,
    set(value: string) {
      const replacement = typeof value === 'string' ? broker(value) : null;
      descriptor.set!.call(this, replacement ?? value);
    },
  });
}

export function installInterceptors(): void {
  const originalOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const raw = url?.toString();
    const replacement = raw ? broker(raw) : null;
    return originalOpen(replacement ?? url, target, features);
  }) as typeof window.open;

  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string): void {
    if ((name === 'href' || name === 'src') && isBrokeredProtocol(value)) value = broker(value) ?? value;
    originalSetAttribute.call(this, name, value);
  };

  patchUrlProperty(HTMLAnchorElement.prototype, 'href');
  patchUrlProperty(HTMLAreaElement.prototype, 'href');
  patchUrlProperty(HTMLIFrameElement.prototype, 'src');

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    const raw = anchor?.getAttribute('href');
    if (!raw || !isBrokeredProtocol(raw)) return;
    const replacement = broker(raw);
    if (!replacement) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(replacement);
  }, true);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) for (const node of mutation.addedNodes) if (node instanceof Element) rewriteTree(node);
  });

  const startObserver = (): void => {
    rewriteTree(document);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.documentElement) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
}
