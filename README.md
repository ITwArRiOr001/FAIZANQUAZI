# FAIZAN QUAZI — UX Portfolio  |  Ocean Museum Edition

**A calm, research-driven immersive experience**  
Premium vanilla HTML/CSS/JS portfolio website

---

## Vision & Metaphor

This portfolio is conceived as an **Ocean Museum** — a curated dive into enterprise product thinking, user research, and design craft.

Just as 95% of our planet’s ocean remains unexplored, the most meaningful design work happens in the depths: listening to segmented users, mapping complex information architectures, pressure-testing prototypes, and surfacing systems that feel inevitable.

The experience uses layered depth metaphors:
- **Epipelagic (Sunlit)**: First impressions & hero
- **Mesopelagic (Twilight)**: Selected work & exhibits
- **Bathypelagic (Midnight)**: Process & method
- **Abyssopelagic (Abyss)**: Career journey
- **Hadal (Deepest)**: Philosophy, values & contact

A depth meter and zone-aware navigation will guide visitors from surface clarity to hadal strategy.

## Current State (June 2026)

High-quality, production-ready foundation already in place:

- **Pure vanilla stack** — no frameworks, no build tools, fully editable in any editor or Android SPCK Editor
- **Elegant editorial design system**: warm neutrals, gold accents, ocean blues. Design tokens in CSS custom properties for easy theming.
- **Immersive Home**: Horizontal chapter pager (smooth swipe / wheel / keyboard / touch, progress bar, dots). Feels like walking through a museum exhibition.
- **Smart Media Placeholders**: Drop real files into `/assets` and they automatically appear. Elegant dashed placeholders guide you on exactly which asset is expected.
- **Work Museum**: Three detailed exhibits (Raintree 2021, AI/ML in CMC, UI Shell Navigation) with horizontal screenshot strips.
- **Career Timeline**: Horizontal scrollable detailed nodes with impact highlights.
- **Consistent multi-page experience**: About (philosophy + toolkit), Process, Contact.
- **Professional interactions**: IntersectionObserver reveals, mobile burger nav, mailto contact handler, responsive typography and layout.
- **Accessibility & performance**: Reduced-motion support, semantic structure, preconnect fonts, performant animations.

## Tech Stack & Philosophy

- HTML5 + CSS3 (custom properties, modern layout, clamp, aspect-ratio) + vanilla ES6 JavaScript
- Typography: Cormorant Garamond (display) + Jost (UI)
- Zero dependencies — maximum control, portability, and maintainability
- Self-documenting, clearly sectioned code

## Project Structure

```
FAIZANQUAZI/
├── index.html          # Immersive Ocean Museum home (horizontal chapters)
├── about.html          # Philosophy, strengths, expertise
├── work.html           # Work Museum — 3 curated exhibits
├── process.html        # UX process (to be deepened with depth metaphors)
├── careers.html        # Detailed career timeline
├── contact.html        # Contact form + details
├── styles.css          # Complete design system + responsive
├── script.js           # All interactions (pager, media loader, reveals, nav)
├── README.md           # This file
└── assets/             # [CREATE THIS] High-res images & optimized video
```

## How to Customize & Maintain

### 1. Assets (Critical for Professional Look)
Create an `assets/` folder in the repo root.

Add your files matching the exact names referenced in the code (the placeholder system will hide automatically when they load successfully):

**Hero & Atmosphere**
- `orca-hero.mp4` + `hero-orca-poster.jpg` (or replace with serene ocean depth footage)
- `about-hero.jpg`, `career-hero.jpg`, `museum-hero.jpg`
- `portrait-faizan.jpg` (professional headshot)

**Work Exhibits (high-quality Figma exports or screenshots)**
- `work-identity.jpg`, `work-aiml.jpg`, `work-shell.jpg` (index cards)
- `raintree-01.jpg` ... `raintree-05.jpg`
- `aiml-01.jpg` ... `aiml-05.jpg`
- `shell-01.jpg` ... `shell-05.jpg`

**Tool Icons** (for about.html skills grid)
- `icon-figma.png`, `icon-xd.png`, etc. (or use simple CSS/SVG)

**Recommendations**
- Export crisp 2x or 3x images from Figma
- Optimize videos (HandBrake or ffmpeg, <5MB ideal for web)
- Use royalty-free ocean/abstract depth imagery for atmosphere if needed (Unsplash, Pexels)
- Keep file names exact so no code changes required

### 2. Content Updates
Edit `.html` files directly. Use `reveal` + `data-d="N"` classes to control staggered animations.
All copy is plain, semantic HTML — easy to refine.

### 3. Styling & Design Tokens
All colors, spacing, typography live in `:root` of `styles.css`. Tweak `--ocean`, `--gold`, `--warm-white` etc. to evolve the palette toward calmer river/ocean museum tones if desired.

### 4. Interactions
`script.js` is modular (wireMedia, wireReveals, wirePager, etc.). Extend the pager or add depth-meter logic here.

### 5. Deployment (GitHub Pages)
1. Push to `main` branch
2. Settings → Pages → Source: Deploy from a branch → `main` / root
3. (Optional) Add `.nojekyll` file for clean URLs
4. Custom domain supported

The site is already live-ready.

## Roadmap — Making It Even More Professional

**Immediate (this session)**
- [x] Added this README
- [ ] Introduce explicit **Depth Meter / Zone Navigation** (fixed indicator + chapter-to-zone mapping)
- [ ] Subtle ambient ocean effects (light rays, gentle currents via CSS/JS)
- [ ] Flesh out `process.html` with full depth-metaphor process steps

**Next Iterations**
- Richer case study details + impact metrics in Work Museum
- Enhanced contact form (Formspree / Netlify Functions or keep elegant mailto)
- Full accessibility audit + keyboard depth navigation
- Performance budgets & image optimization guide
- Optional PWA manifest for installable experience

## Why This Approach

Your preference for calm, mature, intelligent, research-driven work is perfectly served by this editorial museum metaphor. No hype, no heavy frameworks — just thoughtful craft that rewards slow, deep exploration.

---

**Built with intention by Faizan Quazi**  
User Experience Analyst | HCL Software (Commerce)  
Pune / Mumbai, India

© 2014–2026 Faizan Quazi. All rights reserved.

*95% unexplored. Let’s map it together.*