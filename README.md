# Redirect Brocker

A userscript that keeps Slack, Discord, and Zoom navigation in the browser instead of handing it to their desktop applications.

## Supported redirects

- `slack://` → Slack web URLs, preserving workspace/channel/app identifiers when possible.
- `discord://` → Discord web URLs, including channel deep links.
- `zoommtg://` → Zoom Web App meeting URLs, preserving meeting ID and password when available.

Redirect Brocker intercepts links, `window.open`, iframe URLs, and dynamically inserted URL-bearing elements. It intentionally runs only on Slack, Discord, and Zoom web properties.

## Development

The project uses TypeScript and Vite+.

```sh
pnpm install
pnpm check
pnpm test
pnpm build
```

The userscript is emitted as `dist/redirect-brocker.user.js`. Install it with a userscript manager such as Violentmonkey or Tampermonkey.

## Limitations

A web application can assign a custom protocol directly to `window.location`. Browsers do not expose a general, reliable interception API for that sink. Redirect Brocker therefore intercepts the common controllable sinks used by these services: anchors, areas, iframes, DOM URL setters, `setAttribute`, and `window.open`.

Zoom Web App availability can also depend on the meeting/account configuration.

## License

MIT
