import { defineConfig } from 'vite-plus';

const userscriptHeader = `// ==UserScript==
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
// ==/UserScript==`;

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'RedirectBrocker',
      formats: ['iife'],
      fileName: () => 'redirect-brocker.user.js',
    },
    rollupOptions: { output: { banner: userscriptHeader } },
    sourcemap: false,
    minify: false,
  },
  test: { include: ['tests/**/*.test.ts'] },
  lint: { ignorePatterns: ['dist/**'] },
  fmt: { semi: true, singleQuote: true },
});
