/* ============================================================
   PROJECT DATA — single source of truth
   All entries verified against github.com/mdhanvantar-web
   ============================================================ */
window.PORTFOLIO = {
  projects: [
    {
      id: "neon-breach",
      featured: true,
      title: "Neon Breach",
      category: "Game Development",
      year: "2026",
      status: "Playable — Live",
      description:
        "A fast 3D arena shooter that runs entirely in the browser. Survive escalating waves of hostile machines, pick them apart with the pulse carbine, and aim for glowing cores for critical hits. Every fifth wave brings down an Apex Sentinel boss.",
      highlights: [
        "Hand-written vanilla JavaScript on three.js — no build step, no dependencies to fetch",
        "Five enemy archetypes from one data-driven constructor, with explicit core-mesh lists for reliable crit detection",
        "Wave modifier system — SWIFT, IRONCLAD, SWARM, VOLLEY, SCARCE, VOIDLIT — with stacked modifiers from wave 6",
        "Generative WebAudio synth score that scales tempo and instrumentation with wave number",
        "Object pooling for enemies, projectiles, tracers and debris; strict 8-light budget",
        "Playable on mouse/keyboard, touch, and gamepad"
      ],
      tech: ["JavaScript", "Three.js", "WebGL", "WebAudio", "Game Design"],
      links: [
        { label: "Play Live", url: "https://neon-breach-game-three.vercel.app", primary: true },
        { label: "GitHub Pages", url: "https://mdhanvantar-web.github.io/neon-breach-game/" },
        { label: "Repository", url: "https://github.com/mdhanvantar-web/neon-breach-game" }
      ],
      image: "assets/projects/neon-wordmark.png",
      imageAlt: "Neon Breach game wordmark emblem",
      coverStyle: "neon"
    },
    {
      id: "evara",
      featured: false,
      title: "E-VARA",
      category: "AI · Security Platform",
      year: "2026",
      status: "Live — Fork / contribution",
      description:
        "A privacy-first identity intelligence platform for real-time identity monitoring, threat-surface analysis, and executive digital protection. Worked on this as a fork — exploring its React, TypeScript, and Supabase edge-worker architecture.",
      highlights: [
        "Privacy-preserving ingestion using SHA-256 client-side hashing",
        "Explainable risk scoring translated into understandable security decisions",
        "Asynchronous Supabase Edge Worker architecture",
        "HUD-style dashboard with threat visualization"
      ],
      tech: ["React", "TypeScript", "Tailwind CSS", "Supabase", "Vite"],
      links: [
        { label: "Live Site", url: "https://e-vara.vercel.app", primary: true },
        { label: "Repository", url: "https://github.com/mdhanvantar-web/E-vara" }
      ],
      image: "assets/projects/evara-1.png",
      imageAlt: "E-VARA identity intelligence dashboard screenshot",
      coverStyle: "screenshot"
    },
    {
      id: "f1game",
      featured: false,
      title: "F1GAME",
      category: "Game Development",
      year: "2025",
      status: "Complete — Desktop",
      description:
        "A 2D lane-based driving game written from scratch in Java with Swing. Dodge oncoming traffic, track your score, and master keyboard input handling, game loops, and collision logic — core OOP put into practice.",
      highlights: [
        "Built with core Java and Swing — no game engine",
        "Fixed-timestep game loop with javax.swing.Timer",
        "Keyboard input handling and AABB collision detection",
        "Score tracking and escalating difficulty"
      ],
      tech: ["Java", "Swing", "OOP", "Game Logic"],
      links: [
        { label: "Repository", url: "https://github.com/mdhanvantar-web/F1GAME", primary: true }
      ],
      image: null,
      imageAlt: "",
      coverStyle: "java"
    },
    {
      id: "netflix-eda",
      featured: false,
      title: "Netflix EDA",
      category: "Data Analysis",
      year: "2026",
      status: "Complete — Internship Project",
      description:
        "Exploratory data analysis of the Netflix movies and TV shows dataset, built as Project 01 for the Pluto Academy internship. Cleaned, transformed, and visualized the catalog to surface content trends over time.",
      highlights: [
        "Pandas data cleaning and transformation pipeline",
        "Matplotlib and Seaborn visualizations",
        "Catalog trend analysis across genres, ratings and release years"
      ],
      tech: ["Python", "Pandas", "Matplotlib", "Jupyter"],
      links: [
        { label: "Repository", url: "https://github.com/mdhanvantar-web/Netflix-EDA-Project", primary: true }
      ],
      image: null,
      imageAlt: "",
      coverStyle: "data"
    },
    {
      id: "titanic",
      featured: false,
      title: "Titanic Survival Prediction",
      category: "Machine Learning",
      year: "2026",
      status: "Complete",
      description:
        "A classic machine-learning exercise taken end to end — feature engineering, model training, and evaluation in a Jupyter notebook to predict passenger survival outcomes.",
      highlights: [
        "Feature engineering from raw passenger records",
        "Supervised classification model with train/test evaluation",
        "Notebook-documented workflow from data to prediction"
      ],
      tech: ["Python", "scikit-learn", "Pandas", "Jupyter"],
      links: [
        { label: "Repository", url: "https://github.com/mdhanvantar-web/Titanic-Survival-Prediction", primary: true }
      ],
      image: null,
      imageAlt: "",
      coverStyle: "ml"
    },
    {
      id: "assignment-trams",
      featured: false,
      title: "Assignment Tracker",
      category: "Web Development",
      year: "2026",
      status: "Live",
      description:
        "A clean, responsive web application for tracking assignments — built with hand-written HTML and CSS, deployed live on Vercel.",
      highlights: [
        "Semantic HTML and hand-crafted CSS — no framework",
        "Responsive layout across device sizes",
        "Deployed and publicly accessible"
      ],
      tech: ["HTML", "CSS", "Responsive Design"],
      links: [
        { label: "Live Site", url: "https://assignment-trams.vercel.app", primary: true },
        { label: "Repository", url: "https://github.com/mdhanvantar-web/Assignment_trams" }
      ],
      image: null,
      imageAlt: "",
      coverStyle: "web"
    }
  ],

  skills: [
    {
      group: "Game Development",
      icon: "⌘",
      note: "Where my strongest work lives.",
      items: [
        { name: "Game programming", level: "used" },
        { name: "Gameplay mechanics & systems", level: "used" },
        { name: "Three.js / WebGL", level: "used" },
        { name: "Collision detection & physics", level: "used" },
        { name: "Procedural content generation", level: "used" },
        { name: "Game feel & balancing", level: "used" },
        { name: "Unity / Unreal", level: "exploring" }
      ]
    },
    {
      group: "Software Engineering",
      icon: "⚙",
      note: "Core languages and problem-solving.",
      items: [
        { name: "Java", level: "used" },
        { name: "Python", level: "used" },
        { name: "C", level: "familiar" },
        { name: "JavaScript", level: "used" },
        { name: "TypeScript", level: "familiar" },
        { name: "Data structures & algorithms", level: "familiar" },
        { name: "OOP design", level: "used" }
      ]
    },
    {
      group: "Web Development",
      icon: "◈",
      note: "Interfaces I ship and deploy.",
      items: [
        { name: "HTML5 & semantic markup", level: "used" },
        { name: "CSS3 & responsive design", level: "used" },
        { name: "JavaScript (ES6+)", level: "used" },
        { name: "React", level: "familiar" },
        { name: "Vite & modern tooling", level: "familiar" },
        { name: "Vercel & GitHub Pages", level: "used" }
      ]
    },
    {
      group: "AI & Intelligent Systems",
      icon: "◎",
      note: "Explorations in data and intelligence.",
      items: [
        { name: "Data analysis (Pandas, Matplotlib)", level: "used" },
        { name: "Machine learning fundamentals", level: "familiar" },
        { name: "Security-minded development", level: "familiar" },
        { name: "Generative audio systems", level: "used" },
        { name: "Automation scripting", level: "used" },
        { name: "LLM tooling & integrations", level: "exploring" }
      ]
    }
  ],

  journey: [
    {
      date: "2025 — 2029",
      title: "B.Tech — Cyber Security & Engineering",
      org: "Baba Institute of Technology and Sciences",
      text: "Currently building foundations in security engineering while shipping game and software projects on the side."
    },
    {
      date: "2023 — 2025",
      title: "Intermediate Education — MPC",
      org: "Mathematics · Physics · Chemistry",
      text: "Built the analytical grounding in math and physics that now underpins simulation and game-systems work."
    },
    {
      date: "Before 2023",
      title: "Secondary School",
      org: "Foundations",
      text: "Early interest in mathematics and computers — the starting grid for everything that followed."
    }
  ]
};
