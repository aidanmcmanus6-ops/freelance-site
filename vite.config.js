import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Home page — the React SPA (unchanged).
        main: resolve(__dirname, 'index.html'),
        // Static, content-rich service landing pages (real HTML for SEO/AEO).
        webDesign: resolve(__dirname, 'web-design/index.html'),
        aiAutomation: resolve(__dirname, 'ai-automation/index.html'),
        monitoring: resolve(__dirname, 'monitoring/index.html'),
        // About page — local-SEO entity page (founder, story, service area).
        about: resolve(__dirname, 'about/index.html'),
        // Conversion confirmation page (noindex) — fires the lead/booking event.
        thankYou: resolve(__dirname, 'thank-you/index.html'),
        // Privacy notice for analytics and contact-form disclosure.
        privacy: resolve(__dirname, 'privacy/index.html'),
        // Blog.
        blog: resolve(__dirname, 'blog/index.html'),
        blogWebsiteCost: resolve(__dirname, 'blog/small-business-website-cost-south-jersey/index.html'),
        blogAiAgents: resolve(__dirname, 'blog/what-is-an-ai-agent/index.html'),
        blogMonitoring: resolve(__dirname, 'blog/what-monitoring-does/index.html'),
        blogWhatToAutomate: resolve(__dirname, 'blog/what-to-automate/index.html'),
        blogConverting: resolve(__dirname, 'blog/why-your-website-isnt-converting/index.html'),
        blogSyntheticMonitoring: resolve(__dirname, 'blog/synthetic-monitoring-vs-uptime/index.html'),
      },
    },
  },
});
