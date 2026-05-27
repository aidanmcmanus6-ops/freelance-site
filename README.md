# MCM Integrated — Freelance Services Site

A modern, responsive website showcasing professional services in web development, AI automation, and observability/monitoring. Built with clean, accessible HTML, CSS, and vanilla JavaScript.

## Features

- **Hero Section** — Bold landing with service capabilities overview
- **Services Section** — Three core offerings (Modern Websites, AI & Automation, Monitoring & Reliability)
- **Why It Matters** — Interactive solar system visualization with clickable planet buttons showing key business benefits
- **Portfolio** — Recent project examples
- **Testimonials** — Client feedback
- **About & Contact** — Team info and contact form
- **Responsive Design** — Mobile-first layout that adapts to all screen sizes
- **Dark Theme** — Professional dark mode with accent colors
- **Animations** — Smooth fade-in, orbit rings, pulsing effects, and scroll reveals

## File Structure

```
freelance-site/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive features (menu toggle, planet buttons, scroll reveal)
├── logo.png            # Brand logo
├── solarsystem.png     # Interactive solar system image (transparent background)
└── README.md           # This file
```

## Getting Started

### Local Development

1. Clone or open the project directory
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your browser

### No Build Step Required
This is a static site—just open `index.html` in any modern browser. No dependencies or compilation needed.

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
- Replace `logo.png` with your brand logo
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
