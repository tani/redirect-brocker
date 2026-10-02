import { rules } from './services';

const rulesByScheme = new Map(rules.map((rule) => [rule.scheme, rule]));

export function broker(raw: string, base = window.location.href): string | null {
  try {
    const url = new URL(raw, base);
    return rulesByScheme.get(url.protocol)?.rewrite(url)?.href ?? null;
  } catch {
    return null;
  }
}

export function isBrokeredProtocol(raw: string, base = window.location.href): boolean {
  try { return rulesByScheme.has(new URL(raw, base).protocol); }
  catch { return false; }
}
