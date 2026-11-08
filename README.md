# HackSprint 3.0 — Source Code & Design System

Extracted from [hack-with-gdg-s4.vercel.app](https://hack-with-gdg-s4.vercel.app/) using pure, zero-dependency **HTML5**, **CSS3**, and **ES6+ JavaScript**.

---

## 📁 Project Structure

```
HackSprint 3.0/
├── index.html                  # Main markup, semantic sections, SEO & metadata
├── styles.css                  # Complete Neo-Brutalist CSS styling & animations
├── app.js                      # Central configuration, dynamic rendering & interactions
├── serve.js                    # Zero-dependency local development server
├── package.json                # npm scripts for running the local server
├── gdg-ksrce-logo.svg          # Header and footer brand logo
├── devfolio-logo.svg           # Devfolio partner logo
├── og-image.png                # Social media preview card (1200x630)
├── robots.txt                  # Search crawler configuration
├── sitemap.xml                 # SEO sitemap
└── images/
    ├── hackathon-glimpse-1.jpg # Photo carousel image 1
    ├── hackathon-glimpse-2.jpg # Photo carousel image 2
    └── hackathon-glimpse-3.jpg # Photo carousel image 3
```

---

## 🚀 Quick Start (Local Preview)

Run either of the following commands in this directory:

```bash
npm start
```
*or directly with Node.js:*
```bash
node serve.js
```

Then open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🎨 Customizing for HackSprint 3.0

The design system is **config-driven**. The vast majority of content, dates, tracks, prizes, and FAQs can be modified directly in [`app.js`](app.js):

### 1. Event Details & Countdown (`app.js`)
Edit the top-level configuration object:
```javascript
export const S4_CONFIG = {
  eventName: 'HackSprint 3.0',
  organizer: 'Your Organization Name',
  venue: { 
    name: 'Your Venue Name', 
    city: 'City', 
    state: 'State' 
  },
  eventStart: '2026-11-15T09:00:00+05:30', // Sets the countdown clock target
  eventEnd: '2026-11-16T18:00:00+05:30',
  contactEmail: 'contact@hacksprint.org',
  // ...
};
```

### 2. Rounds, Timeline & Schedule (`app.js`)
* `journey.rounds`: Update the registration and hackathon rounds.
* `timeline`: Add or modify timeline stages and dates.
* `experience`: Highlight mentorship, workshops, networking, or planning sprints.

### 3. FAQs & Information (`app.js`)
* `faq`: Add or edit question and answer pairs displayed in the interactive accordion.

### 4. Visual Styling & Color Accents (`styles.css`)
* Font families (`Outfit` and `Space Mono`) are loaded via Google Fonts in [`index.html`](index.html).
* Color variables and styling can be customized in [`styles.css`](styles.css):
  * `--bg`: Dark theme background
  * Google 4-color motif: Blue (`#4285F4`), Red (`#EA4335`), Yellow (`#FBBC04`), Green (`#34A853`)
