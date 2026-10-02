import type { RedirectRule } from '../types';

export const discordRule: RedirectRule = {
  scheme: 'discord:',
  rewrite(url) {
    const path = `${url.hostname}${url.pathname}`.replace(/^\/+/, '');
    if (path.startsWith('-/')) return new URL(`https://discord.com/${path.slice(2)}${url.search}${url.hash}`);
    if (path.startsWith('channels/')) return new URL(`https://discord.com/${path}${url.search}${url.hash}`);
    return new URL('https://discord.com/app');
  },
};
