import { describe, expect, it } from 'vite-plus/test';
import { discordRule } from '../src/services/discord';
import { slackRule } from '../src/services/slack';
import { zoomRule } from '../src/services/zoom';

describe('Slack redirects', () => {
  it('keeps channel and team information', () => {
    expect(slackRule.rewrite(new URL('slack://channel?team=T123&id=C456'))?.href)
      .toBe('https://slack.com/app_redirect?channel=C456&team=T123');
  });
});

describe('Discord redirects', () => {
  it('maps channel deep links to the web app', () => {
    expect(discordRule.rewrite(new URL('discord://-/channels/123/456'))?.href)
      .toBe('https://discord.com/channels/123/456');
  });
});

describe('Zoom redirects', () => {
  it('maps meeting launches to the Zoom Web App', () => {
    expect(zoomRule.rewrite(new URL('zoommtg://zoom.us/join?action=join&confno=123456789&pwd=secret'))?.href)
      .toBe('https://app.zoom.us/wc/123456789/join?pwd=secret');
  });
});
