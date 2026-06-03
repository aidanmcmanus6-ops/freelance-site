# MCM Integrated — Freelance Services Site

A modern, responsive website showcasing professional services in web development, AI automation, and observability/monitoring. Built with React, Vite, Framer Motion, and focused CSS.

## Features

- **Hero Section** — Bold landing with service capabilities overview
- **Services Section** — Three core offerings (Modern Websites, AI & Automation, Monitoring & Reliability)
- **Why It Matters** — Interactive solar system visualization with clickable planet buttons showing key business benefits
- **Portfolio** — Recent project examples
- **Testimonials** — Client feedback
- **About & Contact** — Team info and contact form
- **Responsive Design** — Mobile-first layout that adapts to all screen sizes
- **Dark Theme** — Professional dark mode with accent colors
- **Animations** — Framer Motion reveals, animated intro, orbit rings, pulsing effects, and canvas background motion

## File Structure

```
freelance-site/
├── index.html          # Main HTML structure
├── src/                # React app and components
├── styles.css          # All styling and animations
├── mcm-logo-transparent.png # Transparent site logo
├── intro-animation-clean.mp4 # Intro animation without watermark
├── solarsystem.png     # Interactive solar system image (transparent background)
├── package.json        # Vite/React dependencies and scripts
└── README.md           # This file
```

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local Vite URL shown in the terminal.

### Production Build

```bash
npm run build
```

## Key Sections

### Hero
- Eye-catching headline and subtext
- Call-to-action buttons (primary + secondary)
- Capability cards (Modern Websites, AI Agents, Observability)

### Why It Matters (Solar System)
Interactive visualization with:
- Central sun with warm glow
- 6 orbiting planets (each with clickable detail panels)
- Rotating orbit rings with particle effects
- Responsive planet button sizing on mobile

### Services
Three-column grid highlighting core service offerings with bullet points.

### Contact
Simple contact form placeholder with fields for name, email, and message.

## Customization

### Colors
Edit CSS variables in `:root` in `styles.css`:
```css
--accent: #60a5fa;          /* Primary blue */
--accent-strong: #818cf8;   /* Secondary blue */
--text: #f8fafc;            /* Light text */
--muted: #9fb2c6;           /* Dimmed text */
```

### Images
- Replace `mcm-logo-transparent.png` with your brand logo
- Replace `solarsystem.png` with your own visualization (must have transparent background)

### Text Content
Edit copy directly in `index.html`. All sections are clearly labeled with comments.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive (tested on iOS and Android)
- Supports CSS Grid, Flexbox, CSS Masks, and modern filter effects

## Performance Notes

- Single HTML file with embedded CSS (no external stylesheets except fonts)
- Lightweight PNG images
- Canvas-based tech background animation (smooth on modern devices)
- Minimal JavaScript—mostly vanilla DOM manipulation

## License

Private/Custom Project

## Contact

For updates or modifications, reach out to the project owner.

###hehe  i made an update