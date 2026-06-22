// Homepage "Selected work" entries. Kept in its own file so the case studies
// can be updated without touching the large App.jsx bundle.
// art: 'web' | 'flow' | 'pulse' maps to the ProjectArt illustration in App.jsx.
export const portfolio = [
  {
    title: 'AI Pipeline Rebuilt: Cost per Document Cut 99%+',
    body: 'We redesigned a document-classification system that was running up tens of thousands in silent cloud overages. By trimming each document to the text that mattered and routing to right-sized models, we cut cost per document by more than 99% and scaled it to hundreds of thousands of documents per run.',
    tag: 'AI Automation',
    art: 'flow',
    accent: '#38bdf8',
  },
  {
    title: 'Monitoring That Backstopped a Multi-Million-Dollar Launch',
    body: 'Ahead of a high-visibility website go-live, we stood up dashboards, synthetic checks, and tuned alerting so the team had real-time visibility into uptime, performance, and errors through launch day and the critical days after.',
    tag: 'Monitoring',
    art: 'pulse',
    accent: '#34d399',
  },
  {
    title: 'A Full Sample Web Build',
    body: 'A complete, working sample website for a fictional South Jersey landscaping company, built to show our web design end to end. Clearly labeled as a demo rather than a client project.',
    tag: 'Web Design',
    art: 'web',
    accent: '#8b5cf6',
  },
];
