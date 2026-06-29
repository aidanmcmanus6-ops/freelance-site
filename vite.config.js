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
        // AI Automation town landing pages (local SEO).
        aiTownCherryHill: resolve(__dirname, 'ai-automation/cherry-hill/index.html'),
        aiTownMoorestown: resolve(__dirname, 'ai-automation/moorestown/index.html'),
        aiTownMedford: resolve(__dirname, 'ai-automation/medford/index.html'),
        aiTownMountLaurel: resolve(__dirname, 'ai-automation/mount-laurel/index.html'),
        aiTownMarlton: resolve(__dirname, 'ai-automation/marlton/index.html'),
        aiTownMountHolly: resolve(__dirname, 'ai-automation/mount-holly/index.html'),
        aiTownVoorhees: resolve(__dirname, 'ai-automation/voorhees/index.html'),
        aiTownLumberton: resolve(__dirname, 'ai-automation/lumberton/index.html'),
        aiTownBurlington: resolve(__dirname, 'ai-automation/burlington/index.html'),
        aiTownTrenton: resolve(__dirname, 'ai-automation/trenton/index.html'),
        // Monitoring town landing pages (local SEO).
        monTownCherryHill: resolve(__dirname, 'monitoring/cherry-hill/index.html'),
        monTownMoorestown: resolve(__dirname, 'monitoring/moorestown/index.html'),
        monTownMedford: resolve(__dirname, 'monitoring/medford/index.html'),
        monTownMountLaurel: resolve(__dirname, 'monitoring/mount-laurel/index.html'),
        monTownMarlton: resolve(__dirname, 'monitoring/marlton/index.html'),
        monTownMountHolly: resolve(__dirname, 'monitoring/mount-holly/index.html'),
        monTownVoorhees: resolve(__dirname, 'monitoring/voorhees/index.html'),
        monTownLumberton: resolve(__dirname, 'monitoring/lumberton/index.html'),
        monTownBurlington: resolve(__dirname, 'monitoring/burlington/index.html'),
        monTownTrenton: resolve(__dirname, 'monitoring/trenton/index.html'),
        // Web design town landing pages (local SEO).
        townCherryHill: resolve(__dirname, 'web-design/cherry-hill/index.html'),
        townMoorestown: resolve(__dirname, 'web-design/moorestown/index.html'),
        townMedford: resolve(__dirname, 'web-design/medford/index.html'),
        townMountLaurel: resolve(__dirname, 'web-design/mount-laurel/index.html'),
        townMarlton: resolve(__dirname, 'web-design/marlton/index.html'),
        townMountHolly: resolve(__dirname, 'web-design/mount-holly/index.html'),
        townVoorhees: resolve(__dirname, 'web-design/voorhees/index.html'),
        townLumberton: resolve(__dirname, 'web-design/lumberton/index.html'),
        townBurlington: resolve(__dirname, 'web-design/burlington/index.html'),
        townTrenton: resolve(__dirname, 'web-design/trenton/index.html'),
        // About page — local-SEO entity page (founder, story, service area).
        about: resolve(__dirname, 'about/index.html'),
        // How It Works — process, timelines, pricing expectations.
        howItWorks: resolve(__dirname, 'how-it-works/index.html'),
        // Work — case studies and real results.
        work: resolve(__dirname, 'work/index.html'),
        // Demo — fictional sample builds (noindex) to showcase web design.
        demo: resolve(__dirname, 'demo/index.html'),
        demoLawFirm: resolve(__dirname, 'demo/law-firm/index.html'),
        demoCoffeeShop: resolve(__dirname, 'demo/coffee-shop/index.html'),
        // Concept — experimental homepage direction (noindex), not linked in nav.
        concept: resolve(__dirname, 'concept/index.html'),
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
        blogDowntimeCost: resolve(__dirname, 'blog/what-downtime-actually-costs/index.html'),
        blogSilentFailures: resolve(__dirname, 'blog/when-automations-fail-silently/index.html'),
        blogRebuildVsFix: resolve(__dirname, 'blog/rebuild-vs-fix-your-website/index.html'),
        blogSeenComing: resolve(__dirname, 'blog/the-outage-you-can-see-coming/index.html'),
        blogGoogleVisibility: resolve(__dirname, 'blog/why-you-dont-show-up-on-google/index.html'),
        blogWritingAiPrompts: resolve(__dirname, 'blog/writing-ai-prompts-for-business/index.html'),
        blogSignsNewSite: resolve(__dirname, 'blog/signs-your-south-jersey-business-needs-a-new-website/index.html'),
        blogHowToUseAi: resolve(__dirname, 'blog/how-small-businesses-use-ai/index.html'),
        blogAlertFatigue: resolve(__dirname, 'blog/monitoring-alert-fatigue/index.html'),
        blogHomepageNeeds: resolve(__dirname, 'blog/what-your-homepage-needs/index.html'),
        blogAiChatbots: resolve(__dirname, 'blog/ai-chatbots-for-small-business/index.html'),
        blogThirdPartyTools: resolve(__dirname, 'blog/monitoring-third-party-tools/index.html'),
        blogPageSpeed: resolve(__dirname, 'blog/how-fast-should-your-website-load/index.html'),
      },
    },
  },
});
