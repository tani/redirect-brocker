import type { RedirectRule } from '../types';
import { discordRule } from './discord';
import { slackRule } from './slack';
import { zoomRule } from './zoom';

export const rules: readonly RedirectRule[] = [slackRule, discordRule, zoomRule];
