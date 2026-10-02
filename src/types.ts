export interface RedirectRule {
  readonly scheme: string;
  rewrite(url: URL): URL | null;
}
