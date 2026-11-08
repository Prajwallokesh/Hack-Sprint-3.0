export const S4_CONFIG = {
  eventName: 'HackSprint 3.0', organizer: 'COMPASS × GLUE', venue: { name: 'Government Engineering College, Hassan', city: 'Hassan', state: 'Karnataka' }, location: 'Hassan, Karnataka',
  eventStart: '2026-11-14T15:00:00+05:30', eventEnd: '2026-11-15T15:00:00+05:30', ideationDeadline: 'NOV 12, 2026', contactEmail: 'hacksprint3@gechassan.ac.in',
  instagramHandle: '@compass_gech', instagramUrl: null, contactEmail: 'hacksprint3@gechassan.ac.in',
  countdownStates: {
    before: 'THE 24-HOUR BUILD BEGINS IN',
    during: 'HACKSPRINT 3.0 IS LIVE',
    after: 'THANK YOU, BUILDERS'
  },
  about: {
    body: 'HackSprint is the flagship annual 24-hour offline hackathon presented by COMPASS (Computer Science Students Association, GECH) in collaboration with GLUE at Government Engineering College, Hassan.',
    bodyExtended: ' An intensive, high-energy crucible where passionate student developers, designers, and innovators turn bold ideas into working, impactful technology through non-stop making, expert mentorship, and collaborative engineering.',
    sub: 'From humble beginnings to a multi-college engineering movement — explore the evolution of HackSprint through the years.',
    principles: [
      { num: '1.0', color: 'green', title: 'HackSprint 1.0', body: 'Where it all started. The first offline hackathon at GEC Hassan, where students came together to build real software projects, learn new skills, and start an active coding culture on campus.' },
      { num: '2.0', color: 'green', title: 'HackSprint 2.0', body: 'Bigger and better. Students from different engineering branches worked through the night with guidance from faculty mentors, celebrating great teamwork and winning projects like Team Straw-Hats.' },
      { num: '3.0', color: 'green', title: 'HackSprint 3.0', body: 'The biggest edition yet. A 24-hour offline hackathon bringing together students from 3 government colleges (Hassan, Arsikere, and Mosalehosahalli), pairing senior coders with 1st-year students to innovate together.' }
    ]
  },
  innovation: {
    disclaimer: 'HackSprint 3.0 is an Open Innovation Hackathon. There are no restrictive categories or predefined problem sets — you have full freedom to build any working prototype that creates impact.',
    domains: [
      { label: 'Open Innovation Track', color: 'green' }
    ]
  },
  journey: {
    rounds: [
      {
        index: 'ROUND 01', color: 'blue',
        title: 'IDEATION',
        tagline: 'Submit your vision.',
        body: 'Participants submit their project idea in PPT format. Selection focuses on the strength of the idea, problem understanding, innovation, and potential impact.',
        meta: 'PPT SUBMISSION',
        deadline: 'DEADLINE — NOV 12, 2026, 11:59:00 PM',
        deadlineDatetime: '2026-11-12T23:59:00+05:30',
        note: 'A working prototype is a plus, but not required for Round 1.'
      },
      {
        index: 'ROUND 02', color: 'red',
        title: 'THE HACK',
        tagline: '24 hours. Offline. All in.',
        body: 'Selected teams come to Government Engineering College, Hassan and build their prototype during the 24-hour offline sprint.',
        meta: '24-HOUR OFFLINE HACKATHON',
        deadline: 'NOV 14–15, 2026',
        deadlineDatetime: '2026-11-14T09:00:00+05:30',
        note: '24 continuous hours offline. Kickoff at 09:00 AM on Nov 14, 2026.'
      }
    ],
    stages: [
      { label: 'IDEATE', color: 'blue' },
      { label: 'GET SELECTED', color: 'red' },
      { label: 'BUILD (24H)', color: 'yellow' },
      { label: 'DEMO & WIN', color: 'green' }
    ]
  },
  timeline: [
    { day: 'day1', time: '03:00 PM – 04:00 PM', datetime: '2026-11-14T15:00', title: 'Team Registration & Desk Setup', desc: 'Teams arrive at the venue, complete check-in, and set up their laptops.', tag: 'REGISTRATION', venue: 'LIBRARY BLOCK', color: 'blue' },
    { day: 'day1', time: '04:00 PM – 04:30 PM', datetime: '2026-11-14T16:00', title: 'Opening & Welcome Ceremony', desc: 'Welcome speech, introduction of mentors, and event guidelines.', tag: 'INAUGURATION', venue: 'LIBRARY BLOCK', color: 'green' },
    { day: 'day1', time: '04:30 PM SHARP', datetime: '2026-11-14T16:30', title: 'Problem Statements Launch & Hacking Starts', desc: 'Problem statements are revealed and the 24-hour coding sprint officially begins.', tag: 'HACKATHON START', venue: 'LIBRARY BLOCK', color: 'red', hero: true },
    { day: 'day1', time: '06:00 PM – 06:30 PM', datetime: '2026-11-14T18:00', title: 'Tea & Snacks Break', desc: 'Hot tea and snacks served with initial mentor discussions.', tag: 'TEA BREAK', venue: 'LIBRARY BLOCK', color: 'yellow' },
    { day: 'day1', time: '09:00 PM – 10:00 PM', datetime: '2026-11-14T21:00', title: 'Dinner Break', desc: 'Dinner break for all participants and team progress check.', tag: 'DINNER', venue: 'LIBRARY BLOCK', color: 'green' },
    { day: 'day1', time: '10:30 PM – 12:00 AM', datetime: '2026-11-14T22:30', title: 'Mentoring Round 1', desc: 'Mentors visit teams to check ideas, architecture, and project setup.', tag: 'MENTORING', venue: 'LIBRARY BLOCK', color: 'blue' },
    { day: 'day2', time: '12:30 AM – 01:00 AM', datetime: '2026-11-15T00:30', title: 'Midnight Snacks & Short Break', desc: 'Hot Maggi, tea, coffee, and short fun activities to recharge energy.', tag: 'MIDNIGHT SNACK', venue: 'LIBRARY BLOCK', color: 'yellow' },
    { day: 'day2', time: '04:00 AM – 05:00 AM', datetime: '2026-11-15T04:00', title: 'Night Coding Sprint', desc: 'Teams build core project features with hot coffee available all night.', tag: 'CODING SPRINT', venue: 'LIBRARY BLOCK', color: 'ink' },
    { day: 'day2', time: '08:00 AM – 09:00 AM', datetime: '2026-11-15T08:00', title: 'Morning Breakfast', desc: 'Fresh morning breakfast and coffee to start the final build hours.', tag: 'BREAKFAST', venue: 'LIBRARY BLOCK', color: 'green' },
    { day: 'day2', time: '10:30 AM – 12:00 PM', datetime: '2026-11-15T10:30', title: 'Mentoring Round 2', desc: 'Mentors review working prototypes and give final demo tips.', tag: 'MENTORING', venue: 'LIBRARY BLOCK', color: 'blue' },
    { day: 'day2', time: '01:30 PM – 02:00 PM', datetime: '2026-11-15T13:30', title: 'Code Freeze & Final Project Submission', desc: 'All coding stops. Teams submit their GitHub repository and demo link.', tag: 'CODE FREEZE', venue: 'LIBRARY BLOCK', color: 'red' },
    { day: 'day2', time: '02:00 PM – 03:00 PM', datetime: '2026-11-15T14:00', title: 'Final Presentations & Prize Distribution', desc: 'Finalist project presentations, winner announcements, and prize distribution.', tag: 'VALEDICTORY', venue: 'LIBRARY BLOCK', color: 'yellow', finale: true }
  ],
  experience: [
    {
      index: '01', color: 'blue',
      title: 'MENTORSHIP',
      body: 'Get real-time guidance from experienced developers and industry practitioners throughout the build.',
      graphic: 'mentor'
    },
    {
      index: '02', color: 'red',
      title: 'NETWORKING',
      body: 'Connect with fellow builders, designers, and innovators. Every conversation is a potential collaboration.',
      graphic: 'network'
    },
    {
      index: '03', color: 'yellow',
      title: 'SIDE EVENTS',
      body: 'Workshops, mini-challenges, and activities woven through the 24 hours to keep energy and ideas flowing.',
      graphic: 'events'
    },
    {
      index: '04', color: 'green',
      title: '24-HOUR BUILD',
      body: 'Stay focused, ship fast, and turn your idea into a working prototype with your team in one continuous 24-hour sprint.',
      graphic: 'build'
    }
  ],
  rewards: {
    prizes: [
      {
        index: '01', color: 'yellow',
        title: 'WINNER',
        description: 'Best overall project — strongest idea, execution, and impact.',
        amount: null
      },
      {
        index: '02', color: 'blue',
        title: 'RUNNER-UP',
        description: 'Second-place team recognised for outstanding build quality.',
        amount: null
      },
      {
        index: '03', color: 'red',
        title: 'SECOND RUNNER-UP',
        description: 'Third-place team recognised for innovation and potential.',
        amount: null
      }
    ],
    perks: [
      { index: '01', color: 'blue', title: 'CASH PRIZES', body: 'For winning teams.' },
      { index: '02', color: 'red', title: 'SURPRISE GIFTS', body: 'For standout builders.' },
      { index: '03', color: 'yellow', title: 'EXCLUSIVE SWAG', body: 'Made for the community.' },
      { index: '04', color: 'green', title: 'PARTICIPATION CERTIFICATE', body: 'Mark your build journey.' },
      { index: '05', color: null, title: 'FOOD & REFRESHMENTS', body: 'Throughout the event.' }
    ]
  },
  archives: {
    s2: [
      { id: 's2-01', alt: 'HackSprint 1.0 — teams collaborating during the hackathon', caption: 'HACKSPRINT 1.0 / 01', src: null, feature: true },
      { id: 's2-02', alt: 'HackSprint 1.0 — participants presenting their project', caption: 'HACKSPRINT 1.0 / 02', src: null, feature: false },
      { id: 's2-03', alt: 'HackSprint 1.0 — mentors and builders at work', caption: 'HACKSPRINT 1.0 / 03', src: null, feature: false },
      { id: 's2-04', alt: 'HackSprint 1.0 — closing ceremony and awards', caption: 'HACKSPRINT 1.0 / 04', src: null, feature: false }
    ],
    s3: [
      { id: 's3-01', alt: 'HackSprint 2.0 — team collaboration and laptop demo review', caption: 'HACKSPRINT 2.0 / TEAM COLLAB', src: 'images/hackathon-glimpse-2.jpg', feature: true },
      { id: 's3-02', alt: 'HackSprint 2.0 — builder deep in the 24-hour sprint coding workstation', caption: 'HACKSPRINT 2.0 / BUILD WORKSTATION', src: 'images/hackathon-glimpse-1.jpg', feature: false },
      { id: 's3-03', alt: 'HackSprint 2.0 — hackathon hall with teams, mentor guidance, and building sprint', caption: 'HACKSPRINT 2.0 / THE ARENA', src: 'images/hackathon-glimpse-3.jpg', feature: false },
      { id: 's3-04', alt: 'HackSprint 2.0 — final demo day and celebration', caption: 'HACKSPRINT 2.0 / CELEBRATION', src: null, feature: false }
    ]
  },
  organizers: [],
  sponsors: [
    {
      name: 'COMPASS',
      tier: 'student association',
      url: '#',
      logo: 'images/compass-logo.png',
      alt: 'COMPASS — Computer Science Students Association, GECH'
    }
  ],
  venue: {
    name: 'Government Engineering College, Hassan',
    city: 'Hassan',
    region: 'Karnataka',
    country: 'India',
    address: 'B.M. Road, Hassan, Karnataka - 573201',
    dates: 'NOVEMBER 14–15, 2026',
    format: '24-HOUR OFFLINE SPRINT',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Government+Engineering+College+Hassan+Karnataka&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Government+Engineering+College+Hassan'
  },
  faq: [
    ['WHO CAN PARTICIPATE?', 'Beginners and experienced builders are welcome.'], ['WHAT IS THE TEAM SIZE?', '5 members.'], ['IS THE HACKATHON ONLINE OR OFFLINE?', 'The 24-hour hackathon is offline at Government Engineering College Hassan.'], ['WHAT IS THE THEME?', 'Open Innovation.'], ['DO I NEED A WORKING PROTOTYPE FOR ROUND 1?', 'A prototype is a plus, but selection focuses on the strength of the idea and problem-solving approach.'], ['WHAT ARE THE PRIZES?', 'Prize details will be announced soon.']]
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('navbar');
    const toggle = document.getElementById('menuToggle');
    const mobile = document.getElementById('mobileNav');
    const toast = document.getElementById('navToast');
    let toastTimer = null;

    // --- Toast notification ---
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }

    // --- Mobile menu ---
    function setMenu(open) {
      mobile?.classList.toggle('open', open);
      mobile?.setAttribute('aria-hidden', String(!open));
      if (open) { mobile?.removeAttribute('inert'); }
      else { mobile?.setAttribute('inert', ''); }
      toggle?.setAttribute('aria-expanded', String(open));
      toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      // lock body scroll when menu open on mobile
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle?.addEventListener('click', () => setMenu(!mobile?.classList.contains('open')));
    mobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // --- Active section (IntersectionObserver — no scroll listener) ---
    const navLinks = [...document.querySelectorAll('.desktop-nav a[data-section], .mobile-nav a[data-section]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    function setActive(id) {
      navLinks.forEach(a => {
        const active = a.dataset.section === id;
        a.classList.toggle('active', active);
        // aria-current: 'page' when active, remove attr when not
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.3, 0.6] });
    sections.forEach(s => sectionObserver.observe(s));

    // --- Scroll: header elevation (rAF-throttled) ---
    let rafPending = false;
    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        header?.classList.toggle('scrolled', scrollY > 20);
        rafPending = false;
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Venue directions placeholder
    document.querySelectorAll('[data-placeholder-action]').forEach(b =>
      b.addEventListener('click', () => showToast('Directions will be available when the venue map is published.'))
    );
    // --- Hero: populate copy from S4_CONFIG ---
    const heroOrg = document.querySelector('[data-hero-org]');
    const heroLede = document.querySelector('[data-hero-lede]');
    if (heroOrg) heroOrg.textContent = S4_CONFIG.organizer.toUpperCase();
    if (heroLede) heroLede.textContent = '24 Hours of Innovation, Building, and Impact!';

    // --- Hero: pointer parallax on world layer (desktop only) ---
    const heroWorld = document.getElementById('heroWorld');
    if (heroWorld && window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let tiltRaf = null;
      document.addEventListener('mousemove', e => {
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const dx = (e.clientX / vw - 0.5) * 2;
          const dy = (e.clientY / vh - 0.5) * 2;
          const elements = heroWorld.querySelectorAll('.hw-obj, .hw-node, .hw-cloud, .hw-tree');
          elements.forEach((el, i) => {
            const depth = (i % 4 + 1) * 0.4;
            el.style.transform = `translate(${dx * depth * 8}px, ${dy * depth * 5}px)`;
          });
          tiltRaf = null;
        });
      });
    }

    // --- Hero: Anime Student Developers (Boy & Girl) Interactive Dialogue Engine ---
    const studentWrap = document.getElementById('hwStudent');
    const speechText = document.getElementById('studentSpeechText');
    const speechBubble = document.getElementById('studentSpeech');

    const girlWrap = document.getElementById('hwGirl');
    const girlSpeechText = document.getElementById('girlSpeechText');
    const girlSpeechBubble = document.getElementById('girlSpeech');

    const soundToggle = document.getElementById('hwSoundToggle');

    // Dialogue List with College Texting Slang, Relatable Hackathon Banter & Typos (Desktop Duo Mode)
    const ANIME_DIALOGUES = [
      {
        boy: "Are you Registered ?",
        girl: "Im Lready registered ." // Exact prompt typo!
      },
      {
        boy: "wich prbm statement u pickin ??",
        girl: "ai agent for hackathonn !! 🤖"
      },
      {
        boy: "is seats left for hsn clg ??",
        girl: "hurry bro only few left ! ⚡"
      },
      {
        boy: "u got 4 ppl squadd ready ?",
        girl: "yess full team locked inn ! 🔥"
      },
      {
        boy: "r u bringin energy drinks ??",
        girl: "redbull + 24hr coffe readyy ! ☕"
      },
      {
        boy: "what if wifi goes downn ??",
        girl: "offline first app bro haha ! 💻"
      },
      {
        boy: "we winnin 1st prize 40k ??",
        girl: "100% trophy is ourss ! 🏆"
      },
      {
        boy: "did u join whatspp groupp ??",
        girl: "yeaa already in main group ! 📱"
      },
      {
        boy: "library block for all rounds rite ?",
        girl: "yep 24h non-stopp coding ! 🚀"
      },
      {
        boy: "what about food & snacks ??",
        girl: "midnight pizza & chai sortedd ! 🍕"
      }
    ];

    // Solo rallying quotes for Boy on mobile/responsive screens (<900px)
    const BOY_MOBILE_QUOTES = [
      '24H TO BUILD! 🚀',
      'TIME TO CODE! ⚡',
      "LET'S REGISTER! 💻",
      'GEC HASSAN SPRINT! 🏛️',
      'COMPASS × HACKSPRINT! 🔥'
    ];
    let mobileQuoteIndex = 0;

    function isMobileScreen() {
      return window.innerWidth < 900;
    }

    let dialogueIndex = 0;
    let dialogueTimer = null;
    let animeAudioCtx = null;
    let soundEnabled = true;

    // Load saved sound preference
    try {
      const savedPref = localStorage.getItem('hacksprint_anime_sound');
      if (savedPref !== null) {
        soundEnabled = savedPref === 'true';
      }
    } catch (e) {}

    function updateSoundToggleUI() {
      if (!soundToggle) return;
      const icon = soundToggle.querySelector('.hw-sound-icon');
      const label = soundToggle.querySelector('.hw-sound-text');
      if (soundEnabled) {
        soundToggle.classList.remove('is-muted');
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'SOUND ON';
        soundToggle.setAttribute('aria-pressed', 'true');
        soundToggle.setAttribute('title', 'Click to turn sound OFF');
      } else {
        soundToggle.classList.add('is-muted');
        if (icon) icon.textContent = '🔇';
        if (label) label.textContent = 'SOUND OFF';
        soundToggle.setAttribute('aria-pressed', 'false');
        soundToggle.setAttribute('title', 'Click to turn sound ON');
      }
    }
    updateSoundToggleUI();

    function playSoundToggleChime(enable) {
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        if (enable) {
          // Playful ascending two-tone confirmation (C5 -> G5)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(783.99, now + 0.08);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } else {
          // Soft descending sound off tone (G4 -> E4)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(392.00, now);
          osc.frequency.setValueAtTime(329.63, now + 0.07);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.24);
        }
      } catch (err) {}
    }

    if (soundToggle) {
      function handleSoundToggle(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        soundEnabled = !soundEnabled;
        try {
          localStorage.setItem('hacksprint_anime_sound', soundEnabled ? 'true' : 'false');
        } catch (err) {}
        updateSoundToggleUI();
        playSoundToggleChime(soundEnabled);
      }

      soundToggle.addEventListener('click', handleSoundToggle);
    }

    function getAudioCtx() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!animeAudioCtx) animeAudioCtx = new AudioContextClass();
        if (animeAudioCtx.state === 'suspended') {
          animeAudioCtx.resume();
        }
        return animeAudioCtx;
      } catch (err) {
        return null;
      }
    }

    // Sound 1: Comic Bubble Pop
    function playBubblePop() {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {}
    }

    // Sound 2: Boy 8-bit chatter typewriter
    function playBoyChatter() {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const notes = [440, 554.37, 493.88, 659.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.045);
          gain.gain.setValueAtTime(0.14, now + i * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.045);
          osc.stop(now + i * 0.045 + 0.045);
        });
      } catch (e) {}
    }

    // Sound 3: Girl bright anime sparkle chime
    function playGirlChatter() {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const notes = [783.99, 987.77, 1174.66, 1567.98];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.045);
          gain.gain.setValueAtTime(0.16, now + i * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.045);
          osc.stop(now + i * 0.045 + 0.08);
        });
      } catch (e) {}
    }

    // Sound 4: Power Chime on Direct Click
    function playPowerChime(isGirl = false) {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isGirl ? 'sine' : 'triangle';
        const freqs = isGirl ? [659.25, 830.61, 987.77, 1318.51, 1975.53] : [523.25, 659.25, 783.99, 1046.5, 1318.51];
        freqs.forEach((f, idx) => {
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
        });
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.44);
      } catch (e) {}
    }

    function showBoySpeech(text, isInteractive = false) {
      if (!speechText || !speechBubble) return;
      speechText.textContent = text;
      speechBubble.classList.remove('is-speaking', 'pop');
      void speechBubble.offsetWidth;
      speechBubble.classList.add('is-speaking', 'pop');
      setTimeout(() => speechBubble.classList.remove('pop'), 350);

      if (isInteractive) {
        playPowerChime(false);
      } else {
        playBoyChatter();
      }
    }

    function showGirlSpeech(text, isInteractive = false) {
      if (!girlSpeechText || !girlSpeechBubble) return;
      girlSpeechText.textContent = text;
      girlSpeechBubble.classList.remove('is-speaking', 'pop');
      void girlSpeechBubble.offsetWidth;
      girlSpeechBubble.classList.add('is-speaking', 'pop');
      setTimeout(() => girlSpeechBubble.classList.remove('pop'), 350);

      if (isInteractive) {
        playPowerChime(true);
      } else {
        playGirlChatter();
      }
    }

    function hideBothSpeech() {
      if (speechBubble) speechBubble.classList.remove('is-speaking');
      if (girlSpeechBubble) girlSpeechBubble.classList.remove('is-speaking');
    }

    // Step sequence in automated loop
    let autoStep = 0; // Desktop: 0 = Boy speaks, 1 = Girl replies, 2 = Rest. Mobile: 0 = Speak, 1 = Rest
    function runDialogueLoop() {
      clearTimeout(dialogueTimer);

      if (isMobileScreen()) {
        // MOBILE / RESPONSIVE SCREEN: Keep only boy; girl never speaks
        if (girlSpeechBubble) girlSpeechBubble.classList.remove('is-speaking');

        if (autoStep === 0) {
          const quote = BOY_MOBILE_QUOTES[mobileQuoteIndex];
          showBoySpeech(quote, false);
          autoStep = 1;
          dialogueTimer = setTimeout(runDialogueLoop, 3200);
        } else {
          if (speechBubble) speechBubble.classList.remove('is-speaking');
          autoStep = 0;
          mobileQuoteIndex = (mobileQuoteIndex + 1) % BOY_MOBILE_QUOTES.length;
          dialogueTimer = setTimeout(runDialogueLoop, 700);
        }
      } else {
        // DESKTOP SCREEN: Full dialogue between Boy and Girl (100% UNCHANGED)
        const pair = ANIME_DIALOGUES[dialogueIndex];

        if (autoStep === 0) {
          // Step 0: Boy asks
          if (girlSpeechBubble) girlSpeechBubble.classList.remove('is-speaking');
          showBoySpeech(pair.boy, false);
          autoStep = 1;
          dialogueTimer = setTimeout(runDialogueLoop, 3200);
        } else if (autoStep === 1) {
          // Step 1: Girl replies
          showGirlSpeech(pair.girl, false);
          autoStep = 2;
          dialogueTimer = setTimeout(runDialogueLoop, 3400);
        } else {
          // Step 2: Brief pause & advance to next question
          hideBothSpeech();
          autoStep = 0;
          dialogueIndex = (dialogueIndex + 1) % ANIME_DIALOGUES.length;
          dialogueTimer = setTimeout(runDialogueLoop, 700);
        }
      }
    }

    // Start auto loop after gentle initial page delay
    setTimeout(() => {
      runDialogueLoop();
    }, 1000);

    // Tactile Touch & Pointer Feedback for Entire Character Hitbox
    if (studentWrap) {
      ['pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
        studentWrap.addEventListener(evt, () => studentWrap.classList.add('is-pressed'), { passive: true });
      });
    }
    if (girlWrap) {
      ['pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
        girlWrap.addEventListener(evt, () => girlWrap.classList.add('is-pressed'), { passive: true });
      });
    }
    ['pointerup', 'mouseup', 'touchend', 'pointercancel'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (studentWrap) studentWrap.classList.remove('is-pressed');
        if (girlWrap) girlWrap.classList.remove('is-pressed');
      }, { passive: true });
    });

    // Interactive Click Handlers (Full Character Image & Bubble Clickable)
    function onBoyInteract(e) {
      if (e) e.stopPropagation();
      clearTimeout(dialogueTimer);

      if (isMobileScreen()) {
        // On mobile, advance to next solo quote with tactile pop and chime
        if (girlSpeechBubble) girlSpeechBubble.classList.remove('is-speaking');
        mobileQuoteIndex = (mobileQuoteIndex + 1) % BOY_MOBILE_QUOTES.length;
        const quote = BOY_MOBILE_QUOTES[mobileQuoteIndex];
        showBoySpeech(quote, true);

        // Resume loop after reading delay
        autoStep = 1;
        dialogueTimer = setTimeout(() => {
          if (speechBubble) speechBubble.classList.remove('is-speaking');
          autoStep = 0;
          mobileQuoteIndex = (mobileQuoteIndex + 1) % BOY_MOBILE_QUOTES.length;
          dialogueTimer = setTimeout(runDialogueLoop, 700);
        }, 3400);
      } else {
        // Desktop Screen: Advance to next boy question; girl replies 1.5s later (100% UNCHANGED)
        dialogueIndex = (dialogueIndex + 1) % ANIME_DIALOGUES.length;
        const pair = ANIME_DIALOGUES[dialogueIndex];
        if (girlSpeechBubble) girlSpeechBubble.classList.remove('is-speaking');
        showBoySpeech(pair.boy, true);

        // Schedule girl to reply 1.5s later
        autoStep = 2;
        dialogueTimer = setTimeout(() => {
          showGirlSpeech(pair.girl, false);
          dialogueTimer = setTimeout(() => {
            hideBothSpeech();
            autoStep = 0;
            dialogueIndex = (dialogueIndex + 1) % ANIME_DIALOGUES.length;
            dialogueTimer = setTimeout(runDialogueLoop, 800);
          }, 3200);
        }, 1500);
      }
    }

    function onGirlInteract(e) {
      if (e) e.stopPropagation();
      if (isMobileScreen()) return; // Girl is hidden on mobile screens
      clearTimeout(dialogueTimer);
      const pair = ANIME_DIALOGUES[dialogueIndex];
      showGirlSpeech(pair.girl, true);

      // Schedule next exchange
      autoStep = 0;
      dialogueIndex = (dialogueIndex + 1) % ANIME_DIALOGUES.length;
      dialogueTimer = setTimeout(() => {
        hideBothSpeech();
        dialogueTimer = setTimeout(runDialogueLoop, 900);
      }, 2800);
    }

    // Responsive Screen Switch Listener (Mobile <-> Desktop)
    let prevIsMobile = isMobileScreen();
    window.addEventListener('resize', () => {
      const currentIsMobile = isMobileScreen();
      if (currentIsMobile !== prevIsMobile) {
        prevIsMobile = currentIsMobile;
        clearTimeout(dialogueTimer);
        hideBothSpeech();
        autoStep = 0;
        dialogueTimer = setTimeout(runDialogueLoop, 400);
      }
    }, { passive: true });

    if (studentWrap) {
      studentWrap.addEventListener('click', onBoyInteract);
      studentWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBoyInteract(e);
        }
      });
    }

    if (girlWrap) {
      girlWrap.addEventListener('click', onGirlInteract);
      girlWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onGirlInteract(e);
        }
      });
    }

    // --- About section: populate from S4_CONFIG ---
    const aboutBody = document.querySelector('[data-about-body]');
    const aboutSub = document.querySelector('[data-about-sub]');
    if (aboutBody) {
      aboutBody.innerHTML = `<span>${S4_CONFIG.about.body}</span><span class="about-more-text">${S4_CONFIG.about.bodyExtended}</span>`;
    }
    if (aboutSub) aboutSub.textContent = S4_CONFIG.about.sub;

    const principlesGrid = document.getElementById('principlesGrid');
    if (principlesGrid) {
      S4_CONFIG.about.principles.forEach(p => {
        const el = document.createElement('article');
        el.className = `principle-card accent-${p.color}`;
        el.setAttribute('role', 'listitem');
        el.innerHTML = `<span class="principle-num">EDITION ${p.num}</span><h3 class="accent-${p.color}">${p.title}</h3><p>${p.body}</p>`;
        principlesGrid.append(el);
      });
    }

    // --- About section principles animation: scroll-driven active state ---
    const aboutSection = document.getElementById('about');
    if (aboutSection && principlesGrid) {
      const principlesObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        [...principlesGrid.children].forEach((card, i) => {
          setTimeout(() => {
            card.classList.add('visible-accent');
          }, i * 160);
        });
        principlesObserver.unobserve(aboutSection);
      }, { threshold: 0.25 });
      principlesObserver.observe(aboutSection);
    }

    // --- Innovation section: populate from S4_CONFIG ---
    const disclaimerEl = document.querySelector('[data-innovation-disclaimer]');
    if (disclaimerEl) disclaimerEl.textContent = S4_CONFIG.innovation.disclaimer;

    const domainGrid = document.getElementById('domainGrid');
    if (domainGrid) {
      S4_CONFIG.innovation.domains.forEach(d => {
        const tag = document.createElement('span');
        tag.className = 'domain-tag';
        tag.setAttribute('role', 'listitem');
        tag.textContent = d.label;
        if (d.color) tag.dataset.color = d.color;
        domainGrid.append(tag);
      });
    }

    // --- Journey section: populate from S4_CONFIG ---
    const journeyRounds = document.getElementById('journeyRounds');
    if (journeyRounds) {
      S4_CONFIG.journey.rounds.forEach(r => {
        const art = document.createElement('article');
        art.className = `round-card round-${r.color}`;
        art.innerHTML =
          `<span class="round-index">${r.index}</span>` +
          `<h3>${r.title}</h3>` +
          `<p class="round-tagline">${r.tagline}</p>` +
          `<p>${r.body}</p>` +
          `<span class="round-meta">${r.meta}</span>` +
          `<time class="round-deadline" datetime="${r.deadlineDatetime}">${r.deadline}</time>` +
          (r.note ? `<p class="round-note">${r.note}</p>` : '');
        journeyRounds.append(art);
      });
    }

    const stageRail = document.getElementById('stageRail');
    if (stageRail) {
      S4_CONFIG.journey.stages.forEach((s, i) => {
        const li = document.createElement('li');
        li.className = 'stage-item';
        li.dataset.color = s.color;
        // sr-only index so screen readers get sequence context
        li.innerHTML =
          `<span class="sr-only">${i + 1}. </span>` +
          `<div class="stage-node" aria-hidden="true"></div>` +
          `<span class="stage-label">${s.label}</span>`;
        stageRail.append(li);
      });

      // IntersectionObserver: stagger-activate stages as rail enters viewport
      const stageItems = [...stageRail.querySelectorAll('.stage-item')];
      let activated = false;
      const journeyObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || activated) return;
        activated = true;
        stageItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.add('stage-active');
            // fill the connecting line after last stage activates
            if (i === stageItems.length - 1) stageRail.classList.add('rail-filled');
          }, i * 200);
        });
        journeyObserver.disconnect();
      }, { threshold: 0.4 });
      journeyObserver.observe(stageRail);
    }

    // --- Countdown ---
    (function initCountdown() {
      const section = document.getElementById('countdown-section');
      const stateEl = document.querySelector('[data-countdown-state]');
      const inlineEl = document.querySelector('[data-countdown-state-inline]');
      const summaryEl = document.querySelector('[data-countdown-summary]');
      const units = ['days', 'hours', 'minutes', 'seconds'];

      const tStart = +new Date(S4_CONFIG.eventStart);
      const tEnd = +new Date(S4_CONFIG.eventEnd);
      const states = S4_CONFIG.countdownStates;

      // cache slot elements once
      const slots = {};
      units.forEach(u => {
        const unit = section?.querySelector(`[data-cd-unit="${u}"]`);
        slots[u] = unit ? {
          slot: unit.querySelector('.cd-slot'),
          cur: unit.querySelector('.cd-cur'),
          next: unit.querySelector('.cd-next')
        } : null;
      });

      let lastValues = {};
      let lastSummaryMin = -1;
      let isInitialTick = true;

      function getState(now) {
        if (now < tStart) return 'before';
        if (now < tEnd) return 'during';
        return 'after';
      }

      function calcValues(now, state) {
        const target = state === 'before' ? tStart : tEnd;
        const diff = Math.max(0, target - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        return [days, hours, mins, secs];
      }

      function updateDigit(u, next) {
        const s = slots[u];
        if (!s) return;

        if (isInitialTick) {
          if (s.cur) s.cur.textContent = next;
          if (s.next) s.next.textContent = '';
          return;
        }

        if (s.next) s.next.textContent = next;
        s.slot.classList.remove('flipping');
        void s.slot.offsetWidth; // force reflow
        s.slot.classList.add('flipping');

        setTimeout(() => {
          if (s.cur) s.cur.textContent = next;
          if (s.next) s.next.textContent = '';
          s.slot.classList.remove('flipping');
        }, 220);
      }

      function tick() {
        const now = Date.now();
        const state = getState(now);
        const label = states[state];

        if (stateEl && stateEl.textContent !== label) stateEl.textContent = label;
        if (inlineEl && inlineEl.textContent !== 'NOV 14–15, 2026 • 24-HOUR HACKATHON') inlineEl.textContent = 'NOV 14–15, 2026 • 24-HOUR HACKATHON';
        if (section && section.dataset.state !== state) section.dataset.state = state;

        if (state === 'after') {
          units.forEach(u => { if (slots[u]?.cur) slots[u].cur.textContent = '00'; });
          return;
        }

        const vals = calcValues(now, state);
        units.forEach((u, i) => {
          const next = String(vals[i]).padStart(2, '0');
          if (isInitialTick || next !== lastValues[u]) {
            updateDigit(u, next);
            lastValues[u] = next;
          }
        });

        isInitialTick = false;

        // sr summary: announce event dates
        if (summaryEl && summaryEl.textContent !== 'HackSprint 3.0 begins on November 14, 2026.') {
          summaryEl.textContent = 'HackSprint 3.0 begins on November 14, 2026.';
        }
      }

      tick();
      setInterval(tick, 1000);
    })();

    // --- Postponed Announcement Modal ---
    (function initPostponedModal() {
      const modal = document.getElementById('postponedModal');
      const closeBtn = document.getElementById('modalCloseBtn');
      const ackBtn = document.getElementById('modalAcknowledgeBtn');
      if (!modal) return;

      function openModal() {
        modal.classList.add('is-active');
        document.body.classList.add('modal-open');
        setTimeout(() => {
          if (ackBtn) ackBtn.focus();
        }, 120);
      }

      function closeModal() {
        modal.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }

      // Automatically pop up when website opens
      setTimeout(openModal, 280);

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (ackBtn) ackBtn.addEventListener('click', closeModal);

      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
          closeModal();
        }
      });
    })();

    // Reveal: mark document as JS-ready first, then add will-animate + observe
    document.documentElement.classList.add('js-reveal-ready');
    const revealObserver = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('will-animate');
      revealObserver.observe(el);
    });
    // Immediately reveal anything already in viewport
    document.querySelectorAll('.reveal.will-animate').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
    });
    // --- Rewards section: render prize cards + perks from S4_CONFIG ---
    (function initRewards() {
      const prizeGrid = document.getElementById('prizeGrid');
      if (prizeGrid) {
        S4_CONFIG.rewards.prizes.forEach((p, i) => {
          const li = document.createElement('li');
          li.className = 'prize-card';
          li.setAttribute('role', 'listitem');
          li.dataset.color = p.color;
          li.style.transitionDelay = `${i * 80}ms`;
          const amountAttr = p.amount === null ? ' data-pending' : '';
          const amountText = p.amount !== null ? p.amount : 'COMING SOON';
          li.innerHTML =
            `<div class="prize-card-header">` +
            `<span class="prize-index">${p.index}</span>` +
            `<svg class="prize-ribbon-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5,3 L19,3 L19,21 L12,17 L5,21 Z" stroke="#0a0a0a" stroke-width="2" fill="currentColor"/></svg>` +
            `</div>` +
            `<h3>${p.title}</h3>` +
            `<p class="prize-desc">${p.description}</p>` +
            `<div class="prize-amount">` +
            `<span class="prize-amount-value"${amountAttr}>${amountText}</span>` +
            `</div>`;
          prizeGrid.append(li);
        });

        let prizeDone = false;
        const prizeRect = prizeGrid.getBoundingClientRect();
        if (prizeRect.top < window.innerHeight) {
          [...prizeGrid.querySelectorAll('.prize-card')].forEach(c => c.classList.add('prize-visible'));
          prizeDone = true;
        }
        const prizeObserver = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting || prizeDone) return;
          prizeDone = true;
          [...prizeGrid.querySelectorAll('.prize-card')].forEach((card, i) => {
            setTimeout(() => card.classList.add('prize-visible'), i * 100);
          });
          prizeObserver.disconnect();
        }, { threshold: 0.1 });
        if (!prizeDone) prizeObserver.observe(prizeGrid);
      }

      const perksGrid = document.getElementById('perksGrid');
      if (perksGrid) {
        S4_CONFIG.rewards.perks.forEach((p, i) => {
          const li = document.createElement('li');
          li.className = 'perk-item';
          li.setAttribute('role', 'listitem');
          if (p.color) li.dataset.color = p.color;
          li.style.transitionDelay = `${i * 60}ms`;
          li.innerHTML =
            `<span class="perk-index">${p.index}</span>` +
            `<span class="perk-dot" aria-hidden="true"></span>` +
            `<h3>${p.title}</h3>` +
            `<p>${p.body}</p>`;
          perksGrid.append(li);
        });

        let perksDone = false;
        const perksRect = perksGrid.getBoundingClientRect();
        if (perksRect.top < window.innerHeight) {
          [...perksGrid.querySelectorAll('.perk-item')].forEach(c => c.classList.add('perk-visible'));
          perksDone = true;
        }
        const perksObserver = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting || perksDone) return;
          perksDone = true;
          [...perksGrid.querySelectorAll('.perk-item')].forEach((item, i) => {
            setTimeout(() => item.classList.add('perk-visible'), i * 80);
          });
          perksObserver.disconnect();
        }, { threshold: 0.1 });
        if (!perksDone) perksObserver.observe(perksGrid);
      }
    })();

    // --- Experience section: render from S4_CONFIG + staggered reveal ---
    (function initExperience() {
      const grid = document.getElementById('expGrid');
      if (!grid) return;

      // SVG graphic markup per card type — all primitives, aria-hidden
      const graphics = {
        mentor: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true" class="exp-graphic-mentor">
        <circle cx="120" cy="80" r="68" class="g-ring-outer"/>
        <circle cx="120" cy="80" r="44" class="g-ring-mid"/>
        <circle cx="120" cy="80" r="22" class="g-ring-inner"/>
        <line x1="120" y1="58" x2="120" y2="20" class="g-arrow"/>
        <polyline points="108,32 120,20 132,32" class="g-arrow"/>
        <circle cx="120" cy="80" r="4" class="g-dot"/>
        <line x1="0" y1="80" x2="240" y2="80" stroke="var(--line)" stroke-width="1" opacity="0.4"/>
        <line x1="120" y1="0" x2="120" y2="160" stroke="var(--line)" stroke-width="1" opacity="0.4"/>
      </svg>`,
        network: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true" class="exp-graphic-network">
        <line x1="60" y1="40" x2="120" y2="80" class="g-edge"/>
        <line x1="180" y1="40" x2="120" y2="80" class="g-edge"/>
        <line x1="40" y1="120" x2="120" y2="80" class="g-edge"/>
        <line x1="200" y1="120" x2="120" y2="80" class="g-edge"/>
        <line x1="60" y1="40" x2="40" y2="120" class="g-edge"/>
        <line x1="180" y1="40" x2="200" y2="120" class="g-edge"/>
        <line x1="60" y1="40" x2="180" y2="40" class="g-edge"/>
        <circle cx="120" cy="80" r="14" class="g-node"/>
        <circle cx="120" cy="80" r="5"  class="g-node-fill"/>
        <circle cx="60"  cy="40" r="9"  class="g-node"/>
        <circle cx="180" cy="40" r="9"  class="g-node"/>
        <circle cx="40"  cy="120" r="9" class="g-node"/>
        <circle cx="200" cy="120" r="9" class="g-node"/>
      </svg>`,
        events: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true" class="exp-graphic-events">
        <line x1="0" y1="53" x2="240" y2="53" class="g-rule"/>
        <line x1="0" y1="107" x2="240" y2="107" class="g-rule"/>
        <line x1="80" y1="0" x2="80" y2="160" class="g-rule"/>
        <line x1="160" y1="0" x2="160" y2="160" class="g-rule"/>
        <circle cx="48"  cy="36"  r="14" class="g-dot-b"/>
        <circle cx="152" cy="28"  r="9"  class="g-dot-r"/>
        <circle cx="200" cy="72"  r="16" class="g-dot-y"/>
        <circle cx="88"  cy="96"  r="11" class="g-dot-g"/>
        <circle cx="32"  cy="118" r="8"  class="g-dot-y"/>
        <circle cx="168" cy="128" r="13" class="g-dot-b"/>
        <circle cx="120" cy="52"  r="6"  class="g-dot-r"/>
        <circle cx="56"  cy="140" r="10" class="g-dot-g"/>
      </svg>`,
        build: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true" class="exp-graphic-build">
        <polyline points="20,20 20,50 50,50" class="g-bracket"/>
        <polyline points="220,140 220,110 190,110" class="g-bracket"/>
        <rect x="32" y="72" width="176" height="10" rx="2" class="g-bar-bg"/>
        <rect x="32" y="72" width="132" height="10" rx="2" class="g-bar-fill"/>
        <rect x="32" y="90" width="176" height="6" rx="2" class="g-bar-bg"/>
        <rect x="32" y="90" width="88"  height="6" rx="2" class="g-bar-fill-2"/>
        <circle cx="32"  cy="77" r="4" class="g-dot"/>
        <circle cx="164" cy="77" r="4" class="g-dot"/>
        <line x1="0" y1="80" x2="240" y2="80" stroke="var(--line)" stroke-width="1" opacity="0.3"/>
      </svg>`
      };

      S4_CONFIG.experience.forEach((card, i) => {
        const li = document.createElement('li');
        li.className = 'exp-card';
        li.setAttribute('role', 'listitem');
        li.dataset.color = card.color;
        // stagger delay via inline style
        li.style.transitionDelay = `${i * 80}ms`;
        li.innerHTML =
          `<div class="exp-graphic" aria-hidden="true">${graphics[card.graphic] || ''}</div>` +
          `<div class="exp-body">` +
          `<span class="exp-index">${card.index}</span>` +
          `<h3>${card.title}</h3>` +
          `<p>${card.body}</p>` +
          `</div>`;
        grid.append(li);
      });

      // Staggered reveal: observe the grid container, activate cards one by one
      let expDone = false;
      // Immediately show if already in viewport
      const expRect = grid.getBoundingClientRect();
      if (expRect.top < window.innerHeight) {
        [...grid.querySelectorAll('.exp-card')].forEach(c => c.classList.add('exp-visible'));
        expDone = true;
      }
      const expObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || expDone) return;
        expDone = true;
        [...grid.querySelectorAll('.exp-card')].forEach((card, i) => {
          setTimeout(() => card.classList.add('exp-visible'), i * 100);
        });
        expObserver.disconnect();
      }, { threshold: 0.1 });
      if (!expDone) expObserver.observe(grid);
    })();

    // --- Timeline: Interactive Day Filter & Reveal ---
    (function initTimeline() {
      const tabBtns = document.querySelectorAll('.tl-tab-btn');
      const items = document.querySelectorAll('.tl-item');
      if (!tabBtns.length || !items.length) return;

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter || 'all';

          // Update active state and ARIA attributes
          tabBtns.forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });

          // Filter timeline cards with smooth transition
          items.forEach(item => {
            const itemDay = item.dataset.day;
            const shouldShow = filter === 'all' || itemDay === filter;
            if (shouldShow) {
              item.classList.remove('is-hidden');
            } else {
              item.classList.add('is-hidden');
            }
          });
        });
      });
    })();
    // --- Archives: gallery + lightbox ---
    (function initArchives() {
      const grid = document.getElementById('archiveGrid');
      if (!grid) return;

      // On-brand SVG placeholder frame, unique per slot
      // colors cycle through the 4 brand colors
      const COLORS = ['blue', 'red', 'yellow', 'green'];
      const COLOR_VARS = { blue: 'var(--blue)', red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)' };

      function makePlaceholderSVG(index, label) {
        const c = COLORS[index % 4];
        const cv = COLOR_VARS[c];
        const cx = 200, cy = 130;
        return `<svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="gallery-ph-svg">
        <rect width="400" height="260" fill="var(--surface)"/>
        <line x1="0" y1="65" x2="400" y2="65" stroke="var(--line)" stroke-width="1"/>
        <line x1="0" y1="130" x2="400" y2="130" stroke="var(--line)" stroke-width="1"/>
        <line x1="0" y1="195" x2="400" y2="195" stroke="var(--line)" stroke-width="1"/>
        <line x1="100" y1="0" x2="100" y2="260" stroke="var(--line)" stroke-width="1"/>
        <line x1="200" y1="0" x2="200" y2="260" stroke="var(--line)" stroke-width="1"/>
        <line x1="300" y1="0" x2="300" y2="260" stroke="var(--line)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="72" stroke="${cv}" stroke-width="1" opacity="0.18"/>
        <circle cx="${cx}" cy="${cy}" r="48" stroke="${cv}" stroke-width="1" opacity="0.35"/>
        <circle cx="${cx}" cy="${cy}" r="24" stroke="${cv}" stroke-width="1.5" opacity="0.7"/>
        <path d="M${cx},${cy - 72} A72,72 0 0,1 ${cx + 72},${cy}" stroke="var(--blue)"   stroke-width="2" fill="none"/>
        <path d="M${cx + 72},${cy} A72,72 0 0,1 ${cx},${cy + 72}" stroke="var(--red)"    stroke-width="2" fill="none"/>
        <path d="M${cx},${cy + 72} A72,72 0 0,1 ${cx - 72},${cy}" stroke="var(--yellow)" stroke-width="2" fill="none"/>
        <path d="M${cx - 72},${cy} A72,72 0 0,1 ${cx},${cy - 72}" stroke="var(--green)"  stroke-width="2" fill="none"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${cv}"/>
        <polyline points="16,16 16,36 36,36" stroke="var(--ink)" stroke-width="1.5" fill="none"/>
        <polyline points="384,244 384,224 364,224" stroke="var(--ink)" stroke-width="1.5" fill="none"/>
        <text x="20" y="252" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--muted)" letter-spacing="0.08em">${label}</text>
      </svg>`;
      }

      const seasons = [
        { key: 's2', label: 'EDITION 1.0', title: 'HackSprint 1.0' },
        { key: 's3', label: 'EDITION 2.0', title: 'HackSprint 2.0' }
      ];

      // Flat list of all items for lightbox navigation
      const allItems = [];

      seasons.forEach(season => {
        const items = S4_CONFIG.archives[season.key];
        const article = document.createElement('article');
        article.className = 'archive-season';

        const heading = document.createElement('div');
        heading.className = 'archive-heading';
        heading.innerHTML = `<span>${season.label}</span><h3>${season.title}</h3>`;
        article.append(heading);

        const gallery = document.createElement('div');
        gallery.className = 'archive-gallery';
        gallery.dataset.gallery = season.key;

        items.forEach((item, i) => {
          const globalIndex = allItems.length;
          allItems.push({ ...item, season: season.title });

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gallery-item' + (item.feature ? ' gallery-feature' : '');
          btn.setAttribute('aria-label', item.alt);
          btn.dataset.lbIndex = globalIndex;

          if (item.src) {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'gallery-img';
            btn.append(img);
          } else {
            btn.innerHTML = makePlaceholderSVG(i, item.caption);
            const overlay = document.createElement('span');
            overlay.className = 'gallery-ph-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.textContent = 'PHOTO COMING SOON';
            btn.append(overlay);
          }
          gallery.append(btn);
        });

        article.append(gallery);
        grid.append(article);
      });

      // --- Lightbox ---
      const lb = document.getElementById('lightbox');
      const lbMedia = document.getElementById('lbMedia');
      const lbCap = document.getElementById('lbCaption');
      const lbCount = document.getElementById('lbCounter');
      const lbClose = document.getElementById('lbClose');
      const lbPrev = document.getElementById('lbPrev');
      const lbNext = document.getElementById('lbNext');
      if (!lb) return;

      let current = 0;
      let lastFocus = null;

      function openLb(index) {
        current = index;
        renderLb();
        lb.setAttribute('aria-hidden', 'false');
        lb.removeAttribute('inert');
        lb.classList.add('lb-open');
        document.body.style.overflow = 'hidden';
        lastFocus = document.activeElement;
        lbClose.focus();
      }

      function closeLb() {
        lb.setAttribute('aria-hidden', 'true');
        lb.setAttribute('inert', '');
        lb.classList.remove('lb-open');
        document.body.style.overflow = '';
        lastFocus?.focus();
      }

      function renderLb() {
        const item = allItems[current];
        lbMedia.innerHTML = '';
        if (item.src) {
          const img = document.createElement('img');
          img.src = item.src;
          img.alt = item.alt;
          img.loading = 'lazy';
          img.className = 'lb-img';
          lbMedia.append(img);
        } else {
          lbMedia.innerHTML = makePlaceholderSVG(current, item.caption);
          lbMedia.querySelector('.gallery-ph-svg')?.classList.add('lb-ph-svg');
        }
        lbCap.textContent = item.caption + ' — ' + item.season;
        lbCount.textContent = `${current + 1} / ${allItems.length}`;
        lbPrev.disabled = current === 0;
        lbNext.disabled = current === allItems.length - 1;
      }

      function navigate(dir) {
        const next = current + dir;
        if (next < 0 || next >= allItems.length) return;
        current = next;
        lb.classList.add('lb-transitioning');
        setTimeout(() => {
          renderLb();
          lb.classList.remove('lb-transitioning');
        }, 160);
      }

      // Open on gallery item click
      grid.addEventListener('click', e => {
        const btn = e.target.closest('[data-lb-index]');
        if (btn) openLb(Number(btn.dataset.lbIndex));
      });

      lbClose.addEventListener('click', closeLb);
      lbPrev.addEventListener('click', () => navigate(-1));
      lbNext.addEventListener('click', () => navigate(1));

      // Backdrop click closes
      lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

      // Keyboard: Escape, ArrowLeft, ArrowRight + focus trap
      lb.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeLb(); return; }
        if (e.key === 'ArrowLeft') { navigate(-1); return; }
        if (e.key === 'ArrowRight') { navigate(1); return; }
        // Focus trap
        if (e.key === 'Tab') {
          const focusable = [...lb.querySelectorAll('button:not([disabled])')];
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      // Touch swipe
      let touchStartX = 0;
      lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
      }, { passive: true });
    })();

    // --- Organizers: card grid or empty state ---
    (function initOrganizers() {
      const mount = document.getElementById('organizersMount');
      if (!mount) return;

      if (!S4_CONFIG.organizers.length) {
        mount.innerHTML =
          `<div class="coming-panel">
          <span class="panel-mark">// TEAM MANIFEST</span>
          <strong>TEAM REVEALING<br />SOON.</strong>
          <p>Profiles, roles, and portraits will be added here as the team takes shape.</p>
        </div>`;
        return;
      }

      const cardGrid = document.createElement('ul');
      cardGrid.className = 'org-grid';
      cardGrid.setAttribute('role', 'list');

      S4_CONFIG.organizers.forEach(person => {
        const li = document.createElement('li');
        li.className = 'org-card';
        li.setAttribute('role', 'listitem');

        const photoHTML = person.photo
          ? `<img src="${person.photo}" alt="Portrait of ${person.name}" loading="lazy" class="org-photo">`
          : `<div class="org-photo-ph" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="58" stroke="var(--line)" stroke-width="1"/><circle cx="60" cy="48" r="18" stroke="var(--muted)" stroke-width="1"/><path d="M20,108 Q20,80 60,80 Q100,80 100,108" stroke="var(--muted)" stroke-width="1" fill="none"/></svg></div>`;

        const socialLinks = (person.socials || []).map(s =>
          `<a href="${s.url}" class="org-social" target="_blank" rel="noopener noreferrer" aria-label="${person.name} on ${s.platform}">${s.platform}</a>`
        ).join('');

        li.innerHTML =
          `<div class="org-photo-wrap">${photoHTML}</div>` +
          `<div class="org-body">` +
          `<h3 class="org-name">${person.name}</h3>` +
          `<p class="org-role">${person.role}</p>` +
          (socialLinks ? `<div class="org-socials">${socialLinks}</div>` : '') +
          `</div>`;
        cardGrid.append(li);
      });

      mount.append(cardGrid);
    })();

    // --- Sponsors: card grid or empty state ---
    (function initSponsors() {
      const mount = document.getElementById('sponsorsMount');
      if (!mount) return;

      if (!S4_CONFIG.sponsors.length) {
        mount.innerHTML =
          `<div class="sponsor-empty">
          <svg class="sponsor-empty-svg" viewBox="0 0 600 160" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="80" x2="600" y2="80" stroke="var(--line)" stroke-width="1"/>
            <line x1="150" y1="0" x2="150" y2="160" stroke="var(--line)" stroke-width="1"/>
            <line x1="300" y1="0" x2="300" y2="160" stroke="var(--line)" stroke-width="1"/>
            <line x1="450" y1="0" x2="450" y2="160" stroke="var(--line)" stroke-width="1"/>
            <rect x="40"  y="40" width="70" height="80" rx="2" stroke="var(--line)" stroke-width="1" fill="none"/>
            <rect x="190" y="40" width="70" height="80" rx="2" stroke="var(--line)" stroke-width="1" fill="none"/>
            <rect x="340" y="40" width="70" height="80" rx="2" stroke="var(--line)" stroke-width="1" fill="none"/>
            <rect x="490" y="40" width="70" height="80" rx="2" stroke="var(--line)" stroke-width="1" fill="none"/>
            <line x1="52"  y1="80" x2="98"  y2="80" stroke="var(--blue)"   stroke-width="1.5" opacity="0.4"/>
            <line x1="202" y1="80" x2="248" y2="80" stroke="var(--red)"    stroke-width="1.5" opacity="0.4"/>
            <line x1="352" y1="80" x2="398" y2="80" stroke="var(--yellow)" stroke-width="1.5" opacity="0.4"/>
            <line x1="502" y1="80" x2="548" y2="80" stroke="var(--green)"  stroke-width="1.5" opacity="0.4"/>
          </svg>
          <p class="sponsor-empty-label">SPONSORS TO BE ANNOUNCED</p>
        </div>`;
        return;
      }

      // Group by tier
      const tiers = {};
      S4_CONFIG.sponsors.forEach(s => {
        const t = s.tier || 'partner';
        (tiers[t] = tiers[t] || []).push(s);
      });

      const TIER_ORDER = ['title', 'gold', 'silver', 'bronze', 'student association', 'partner'];
      TIER_ORDER.forEach(tier => {
        if (!tiers[tier]) return;
        const group = document.createElement('div');
        group.className = 'sponsor-tier';
        group.dataset.tier = tier;

        const label = document.createElement('p');
        label.className = 'sponsor-tier-label';
        label.textContent = tier.toUpperCase();
        group.append(label);

        const row = document.createElement('ul');
        row.className = 'sponsor-row';
        row.setAttribute('role', 'list');

        tiers[tier].forEach(s => {
          const li = document.createElement('li');
          li.className = 'sponsor-card';
          li.setAttribute('role', 'listitem');
          const hasUrl = s.url && s.url !== '#' && s.url !== '';
          const inner = hasUrl
            ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.name} — ${tier}">`
            : `<div aria-label="${s.name}">`;
          const close = hasUrl ? `</a>` : `</div>`;
          const logoHTML = s.logo
            ? `<img src="${s.logo}" alt="${s.alt || s.name + ' logo'}" loading="lazy" class="sponsor-logo">`
            : `<span class="sponsor-name-text">${s.name}</span>`;
          li.innerHTML = inner + logoHTML + close;
          row.append(li);
        });

        group.append(row);
        mount.append(group);
      });
    })();

    // --- Venue: render from S4_CONFIG ---
    (function initVenue() {
      const v = S4_CONFIG.venue;
      if (!v) return;

      const details = document.getElementById('venueDetails');
      if (details) {
        details.innerHTML =
          `<p class="venue-name">${v.name}</p>` +
          `<p class="venue-location"><i class="fa-solid fa-location-dot" aria-hidden="true" style="color: var(--green); margin-right: 6px;"></i>${v.address || `${v.city}, ${v.region}`}</p>` +
          `<p class="venue-meta"><strong>${v.dates}</strong></p>`
          ;
      }

      const mapWrap = document.getElementById('venueMap');
      if (mapWrap) {
        mapWrap.innerHTML = '';
        if (v.mapEmbedUrl) {
          const iframe = document.createElement('iframe');
          iframe.src = v.mapEmbedUrl;
          iframe.title = `Map showing location of ${v.name}, ${v.city}`;
          iframe.loading = 'lazy';
          iframe.className = 'venue-map-iframe';
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
          mapWrap.append(iframe);
        }
      }

      const dirWrap = document.getElementById('venueDirections');
      if (dirWrap) {
        dirWrap.innerHTML = '';
        const link = document.createElement('a');
        link.href = v.directionsUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'button button-outline venue-directions-btn';
        link.innerHTML = 'Get directions to GEC Hassan <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" style="font-size: 11px; margin-left: 4px;"></i>';
        dirWrap.append(link);
      }
    })();

    const list = document.getElementById('faqList'); if (list) S4_CONFIG.faq.forEach(([q, a], i) => { const item = document.createElement('div'); item.className = 'faq-item'; item.innerHTML = `<button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-answer-${i}" id="faq-question-${i}"><span>${q}</span><span aria-hidden="true">＋</span></button><div class="faq-answer" id="faq-answer-${i}" role="region" aria-labelledby="faq-question-${i}" hidden><div><p>${a}</p></div></div>`; const button = item.querySelector('button'), answer = item.querySelector('.faq-answer'); button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') === 'true'; button.setAttribute('aria-expanded', String(!open)); answer.hidden = open; answer.classList.toggle('open', !open) }); list.append(item) });

    // --- Final CTA: staggered h2 line entrance ---
    (function initFinalCta() {
      const cta = document.querySelector('.final-cta');
      if (!cta) return;
      // Split h2 into individually-animatable spans (already in HTML as text nodes)
      const h2 = cta.querySelector('h2');
      if (!h2) return;
      // Wrap each text line in a span for stagger — lines are separated by <br>
      // The h2 already has <br> tags; wrap text nodes + em in .cta-line spans
      const nodes = [...h2.childNodes];
      h2.innerHTML = '';
      let lineNodes = [];
      nodes.forEach(node => {
        if (node.nodeName === 'BR') {
          const span = document.createElement('span');
          span.className = 'cta-line';
          lineNodes.forEach(n => span.appendChild(n.cloneNode(true)));
          h2.appendChild(span);
          h2.appendChild(document.createElement('br'));
          lineNodes = [];
        } else {
          lineNodes.push(node);
        }
      });
      if (lineNodes.length) {
        const span = document.createElement('span');
        span.className = 'cta-line';
        lineNodes.forEach(n => span.appendChild(n.cloneNode(true)));
        h2.appendChild(span);
      }

      // Observe and stagger-reveal lines
      let ctaDone = false;
      const ctaRect = cta.getBoundingClientRect();
      if (ctaRect.top < window.innerHeight) {
        [...h2.querySelectorAll('.cta-line')].forEach(line => line.classList.add('cta-line-visible'));
        ctaDone = true;
      }
      const ctaObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || ctaDone) return;
        ctaDone = true;
        [...h2.querySelectorAll('.cta-line')].forEach((line, i) => {
          setTimeout(() => line.classList.add('cta-line-visible'), i * 120);
        });
        ctaObserver.disconnect();
      }, { threshold: 0.2 });
      if (!ctaDone) ctaObserver.observe(cta);
    })();

    // --- Footer: populate Instagram handle from config ---
    (function initFooter() {
      const igMount = document.getElementById('footerInstagram');
      if (!igMount) return;
      if (S4_CONFIG.instagramUrl) {
        igMount.outerHTML = `<a href="${S4_CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="COMPASS GECH on Instagram">${S4_CONFIG.instagramHandle}</a>`;
      } else {
        igMount.textContent = S4_CONFIG.instagramHandle;
      }
    })();

    // --- Resilient Marquee Scroller ---
    // Guarantees continuous, buttery-smooth movement across all platforms and accessibility settings
    (function initMarqueeScroller() {
      const banners = document.querySelectorAll('.marquee-banner');
      banners.forEach(banner => {
        const track = banner.querySelector('.marquee-track');
        if (!track) return;

        // Ensure track has duplicated children for seamless -50% loop
        if (track.children.length === 1) {
          const clone = track.firstElementChild.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        }

        // If reduced motion is active in browser/OS, run JS-driven animation loop
        const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReducedMotion) {
          track.style.animation = 'none';
          let offset = 0;
          let lastTime = performance.now();
          const speed = 75; // px/sec

          function step(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            offset += speed * dt;
            const halfWidth = track.scrollWidth / 2;
            if (halfWidth > 0 && offset >= halfWidth) {
              offset = offset % halfWidth;
            }
            track.style.transform = `translate3d(-${offset}px, 0, 0)`;
            requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      });
    })();

    // --- Back to Top button listener ---
    (function initBackToTop() {
      const btt = document.getElementById('backToTop');
      if (!btt) return;
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btt.classList.add('visible');
        } else {
          btt.classList.remove('visible');
        }
      }, { passive: true });
      btt.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();
  });
}

// ============================================================
// CURSOR — isolated, desktop/fine-pointer only
// Disable flag: set CURSOR_ENABLED = false to kill globally
// ============================================================
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  (function initCursor() {
    const CURSOR_ENABLED = false;
    // Guard: fine pointer only (mouse), no touch, no reduced-motion
    if (!CURSOR_ENABLED) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Also bail if primary input is touch
    if (navigator.maxTouchPoints > 1) return;

    // --- DOM ---
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cur-dot';
    ring.className = 'cur-ring';
    document.body.append(dot, ring);

    // Hide native cursor on body
    document.body.classList.add('custom-cursor');

    // --- State ---
    let mx = -200, my = -200; // start offscreen
    let rx = -200, ry = -200; // ring lags behind
    let state = 'default'; // default | hover | cta | graphic
    let rafId = null;
    let magnetEl = null, magnetRect = null;

    // --- rAF loop: lerp ring toward dot ---
    const LERP = 0.14;
    function loop() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Pause rAF when tab is hidden, resume on visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!rafId) { rafId = requestAnimationFrame(loop); }
    });

    // --- Mouse tracking ---
    document.addEventListener('mousemove', e => {
      if (magnetEl && magnetRect) {
        // Magnetic pull: shift toward element center, max 8px
        const cx = magnetRect.left + magnetRect.width / 2;
        const cy = magnetRect.top + magnetRect.height / 2;
        const dx = (e.clientX - cx) / (magnetRect.width / 2);
        const dy = (e.clientY - cy) / (magnetRect.height / 2);
        mx = e.clientX + dx * 8;
        my = e.clientY + dy * 8;
      } else {
        mx = e.clientX;
        my = e.clientY;
      }
    }, { passive: true });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      dot.classList.add('cur-hidden');
      ring.classList.add('cur-hidden');
    });
    document.addEventListener('mouseenter', () => {
      dot.classList.remove('cur-hidden');
      ring.classList.remove('cur-hidden');
    });

    // --- State detection via delegation ---
    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, .gallery-item, .domain-tag, .faq-question';
    const CTA_SEL = '.button, .button-light, .button-dark, .button-outline, .modal-action-btn, .modal-close-btn';
    const GRAPHIC_SEL = '.hero-graphic, .exp-graphic, .venue-map-wrap, .gallery-item';

    function setState(s) {
      if (state === s) return;
      state = s;
      dot.dataset.state = s;
      ring.dataset.state = s;
    }

    document.addEventListener('mouseover', e => {
      const el = e.target.closest(INTERACTIVE);
      if (!el) { setState('default'); magnetEl = null; return; }

      if (el.matches(CTA_SEL)) {
        setState('cta');
        magnetEl = el;
        magnetRect = el.getBoundingClientRect();
      } else if (el.matches(GRAPHIC_SEL)) {
        setState('graphic');
        magnetEl = null;
      } else {
        setState('hover');
        magnetEl = null;
      }
    }, { passive: true });

    document.addEventListener('mouseout', e => {
      const el = e.target.closest(INTERACTIVE);
      if (el) { setState('default'); magnetEl = null; }
    }, { passive: true });

    // Refresh magnet rect on scroll (rAF-throttled)
    let scrollRaf = false;
    window.addEventListener('scroll', () => {
      if (scrollRaf || !magnetEl) return;
      scrollRaf = true;
      requestAnimationFrame(() => {
        if (magnetEl) magnetRect = magnetEl.getBoundingClientRect();
        scrollRaf = false;
      });
    }, { passive: true });
  })();
}

if (typeof window !== 'undefined') window.S4_CONFIG = S4_CONFIG; if (typeof module !== 'undefined') module.exports = { S4_CONFIG };
