import type { RedirectRule } from '../types';

function appRedirect(params: Record<string, string | null>): URL {
  const target = new URL('https://slack.com/app_redirect');
  for (const [key, value] of Object.entries(params)) if (value) target.searchParams.set(key, value);
  return target;
}

export const slackRule: RedirectRule = {
  scheme: 'slack:',
  rewrite(url) {
    const kind = url.hostname || url.pathname.replace(/^\//, '');
    const team = url.searchParams.get('team');
    const id = url.searchParams.get('id');
    switch (kind) {
      case 'channel':
      case 'user': return appRedirect({ channel: id, team });
      case 'app': return appRedirect({ app: id, team });
      case 'open':
        return team ? new URL(`https://app.slack.com/client/${encodeURIComponent(team)}`) : new URL('https://app.slack.com/');
      default: return new URL('https://app.slack.com/');
    }
  },
};
