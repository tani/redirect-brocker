// ==UserScript==
// @name         Redirect Brocker
// @namespace    https://github.com/tani/redirect-brocker
// @version      0.1.0
// @description  Keep Slack, Discord, and Zoom in the browser instead of opening desktop apps.
// @author       tani
// @match        https://*.slack.com/*
// @match        https://slack.com/*
// @match        https://discord.com/*
// @match        https://*.discord.com/*
// @match        https://zoom.us/*
// @match        https://*.zoom.us/*
// @match        https://zoom.com/*
// @match        https://*.zoom.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function appRedirect(params) {
    const target = new URL('https://slack.com/app_redirect');
    for (const [key, value] of Object.entries(params)) {
      if (value) target.searchParams.set(key, value);
    }
    return target;
  }

  const slackRule = {
    scheme: 'slack:',
    rewrite(url) {
      const kind = url.hostname || url.pathname.replace(/^\//, '');
      const team = url.searchParams.get('team');
      const id = url.searchParams.get('id');
      switch (kind) {
        case 'channel':
        case 'user':
          return appRedirect({ channel: id, team });
        case 'app':
          return appRedirect({ app: id, team });
        case 'open':
          return team
            ? new URL(`https://app.slack.com/client/${encodeURIComponent(team)}`)
            : new URL('https://app.slack.com/');
        default:
          return new URL('https://app.slack.com/');
      }
    },
  };

  const discordRule = {
    scheme: 'discord:',
    rewrite(url) {
      const path = `${url.hostname}${url.pathname}`.replace(/^\/+/, '');
      if (path.startsWith('-/')) {
        return new URL(`https://discord.com/${path.slice(2)}${url.search}${url.hash}`);
      }
      if (path.startsWith('channels/')) {
        return new URL(`https://discord.com/${path}${url.search}${url.hash}`);
      }
      return new URL('https://discord.com/app');
    },
  };

  const zoomRule = {
    scheme: 'zoommtg:',
    rewrite(url) {
      const meetingId = url.searchParams.get('confno');
      if (!meetingId) return new URL('https://app.zoom.us/wc');
      const target = new URL(
        `https://app.zoom.us/wc/${encodeURIComponent(meetingId)}/join`,
      );
      const password = url.searchParams.get('pwd');
      if (password) target.searchParams.set('pwd', password);
      return target;
    },
  };

  const rulesByScheme = new Map(
    [slackRule, discordRule, zoomRule].map((rule) => [rule.scheme, rule]),
  );

  function broker(raw, base = window.location.href) {
    try {
      const url = new URL(raw, base);
      return rulesByScheme.get(url.protocol)?.rewrite(url)?.href ?? null;
    } catch {
      return null;
    }
  }

  function isBrokeredProtocol(raw, base = window.location.href) {
    try {
      return rulesByScheme.has(new URL(raw, base).protocol);
    } catch {
      return false;
    }
  }

  function rewriteElement(element) {
    const attribute = element instanceof HTMLIFrameElement ? 'src' : 'href';
    const raw = element.getAttribute(attribute);
    if (!raw || !isBrokeredProtocol(raw)) return;
    const replacement = broker(raw);
    if (replacement) element.setAttribute(attribute, replacement);
  }

  function rewriteTree(root) {
    if (
      root instanceof HTMLAnchorElement ||
      root instanceof HTMLAreaElement ||
      root instanceof HTMLIFrameElement
    ) {
      rewriteElement(root);
    }
    root
      .querySelectorAll('a[href], area[href], iframe[src]')
      .forEach(rewriteElement);
  }

  function patchUrlProperty(prototype, property) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
    if (!descriptor?.get || !descriptor.set || descriptor.configurable === false) return;
    Object.defineProperty(prototype, property, {
      ...descriptor,
      set(value) {
        const replacement = typeof value === 'string' ? broker(value) : null;
        descriptor.set.call(this, replacement ?? value);
      },
    });
  }

  function installInterceptors() {
    const originalOpen = window.open.bind(window);
    window.open = (url, target, features) => {
      const raw = url?.toString();
      const replacement = raw ? broker(raw) : null;
      return originalOpen(replacement ?? url, target, features);
    };

    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      if ((name === 'href' || name === 'src') && isBrokeredProtocol(value)) {
        value = broker(value) ?? value;
      }
      originalSetAttribute.call(this, name, value);
    };

    patchUrlProperty(HTMLAnchorElement.prototype, 'href');
    patchUrlProperty(HTMLAreaElement.prototype, 'href');
    patchUrlProperty(HTMLIFrameElement.prototype, 'src');

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest('a[href]');
        const raw = anchor?.getAttribute('href');
        if (!raw || !isBrokeredProtocol(raw)) return;
        const replacement = broker(raw);
        if (!replacement) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(replacement);
      },
      true,
    );

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) rewriteTree(node);
        }
      }
    });

    const startObserver = () => {
      rewriteTree(document);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.documentElement) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }

  installInterceptors();
})();
