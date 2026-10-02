import type { RedirectRule } from '../types';

export const zoomRule: RedirectRule = {
  scheme: 'zoommtg:',
  rewrite(url) {
    const meetingId = url.searchParams.get('confno');
    if (!meetingId) return new URL('https://app.zoom.us/wc');
    const target = new URL(`https://app.zoom.us/wc/${encodeURIComponent(meetingId)}/join`);
    const password = url.searchParams.get('pwd');
    if (password) target.searchParams.set('pwd', password);
    return target;
  },
};
