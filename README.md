# HackSprint 3.0 — 24-Hour Offline Hackathon

Official web platform for **HackSprint 3.0**, presented by **COMPASS** (Computer Science Students Association) in collaboration with **GLUE** at **Government Engineering College, Hassan (GECH)** on November 14–15, 2026.

Built with pure, high-performance **HTML5**, **CSS3**, and **ES6+ JavaScript**, featuring a Neo-Brutalist living digital world theme with real-time seat quota management, payment proof verification, and administrative control.

---

## 📁 Project Structure

```
HackSprint 3.0/
├── index.html                  # Landing page, tracks, timeline, interactive mascots & SEO
├── register.html               # Registration portal with dynamic team member validation
├── admin.html                  # Secure admin dashboard for reviewing teams & CSV/Excel export
├── styles.css                  # Neo-Brutalist CSS design system & responsive styling
├── app.js                      # Event configuration, audio synthesis, and interactive logic
├── server.js                   # Node.js + Express + MongoDB Atlas backend
├── vercel.json                 # Vercel routing, clean URLs & Render API proxy rewrites
├── robots.txt                  # Search engine crawler directives
├── sitemap.xml                 # XML sitemap for SEO discovery
└── images/                     # HackSprint 3.0 visual assets, logos, and gallery photos
```

---

## 🚀 Architecture

- **Frontend**: Hosted on [Vercel](https://vercel.com) (Static Edge CDN with `vercel.json` proxy rewrites).
- **Backend API**: Hosted on [Render](https://render.com) (`https://hack-sprint-3-0.onrender.com`), managing:
  - Atomic seat allocation across 4 college tiers (GECH, Malnad, Hassan District, Outstation).
  - USN duplicate verification across teams.
  - Payment screenshot upload handling (`multer`).
  - MongoDB Atlas persistence (`mongoose`).
  - Admin team management and Excel export (`xlsx`).

---

## 🛠️ Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
