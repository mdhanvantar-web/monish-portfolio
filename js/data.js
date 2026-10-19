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
      role: "Solo — design, code, art direction",
      detail: {
        problem:
          "Most browser 3D games either require a heavy build pipeline or ship as toys. I wanted a complete, polished arena shooter that runs from a single index.html — no install, no bundler, playable offline.",
        approach:
          "Everything is hand-written vanilla JavaScript on the three.js WebGL renderer. Geometry, arena layout, and textures are generated procedurally at load, so there are no binary assets to fetch beyond the logo.",
        contribution:
          "Designed and built the entire game: player movement and pointer-lock look, weapon systems, enemy AI, boss encounters, wave modifiers, scoring, and the settings UI.",
        challenges: [
          "Making critical-hit detection reliable — one enemy constructor builds every hostile type, with an explicit core-mesh list so a shield collider can never be mistaken for a weak point.",
          "Holding the real-time light budget to 8 lights: the VOIDLIT blackout modifier re-tunes existing lights and fog instead of adding any, so performance stays predictable.",
          "Keeping it playable across input devices — pointer-lock on desktop, an auto-appearing touch overlay, and full gamepad support."
        ]
      },
      image: "assets/projects/neon-wordmark.webp",
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
      role: "Contributor — fork, code study & modification",
      detail: {
        problem:
          "Identity monitoring tools usually trade privacy for coverage. E-VARA set out to do real-time identity and threat-surface monitoring without centralizing raw personal data.",
        approach:
          "A React + TypeScript front end on the Supabase stack, with ingestion handled asynchronously through edge workers and raw identifiers hashed client-side before anything leaves the browser.",
        contribution:
          "Forked and worked through the codebase — tracing the React/TypeScript architecture and the Supabase edge-worker flow to understand how privacy-preserving ingestion, risk scoring, and the HUD dashboard fit together.",
        challenges: [
          "Following a non-trivial async architecture: client hashing, edge-worker processing, and the risk-scoring pipeline each live in different layers.",
          "Reading an unfamiliar React + TypeScript codebase end to end as a learning exercise rather than a from-scratch build."
        ]
      },
      image: "assets/projects/evara-1.webp",
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
      role: "Solo — build from scratch",
      detail: {
        problem:
          "A deliberate exercise in the fundamentals: build a real-time game without a game engine, so every system — loop, input, collision — has to be understood rather than imported.",
        approach:
          "Plain Java on the Swing toolkit. A fixed-timestep loop drives updates and repaints, with AABB collision checks against oncoming traffic and score tracking that scales difficulty.",
        contribution:
          "Wrote the whole project: entities, the game loop, keyboard input handling, collision logic, scoring, and difficulty ramp.",
        challenges: [
          "Keeping the game loop and rendering decoupled so the simulation stays stable on Swing's paint cycle.",
          "Getting collision and dodge timing to feel fair without a physics library."
        ]
      },
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
      role: "Solo — internship project (Pluto Academy)",
      detail: {
        problem:
          "Raw catalog data is messy and mostly unusable as-is — the task was to turn it into a clean dataset and surface what it actually says about Netflix's content strategy over time.",
        approach:
          "A Pandas pipeline for cleaning and transformation (handling nulls, splitting multi-value fields, parsing dates), then Matplotlib and Seaborn to visualize trends across genres, ratings, and release years.",
        contribution:
          "Built the full notebook end to end: data loading and cleaning, transformation, and the exploratory visualization set.",
        challenges: [
          "Normalizing multi-value columns like cast and listed genres into something analyzable.",
          "Choosing visualizations that communicate a trend rather than just plotting every column."
        ]
      },
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
      role: "Solo — ML exercise",
      detail: {
        problem:
          "A classic supervised-learning problem used to work the full pipeline by hand: from raw passenger records to a model that predicts survival, evaluated honestly on held-out data.",
        approach:
          "Feature engineering from the raw records (filling and encoding missing values, deriving features like family size), training a supervised classifier, and evaluating it on a train/test split.",
        contribution:
          "Wrote the notebook end to end — feature preparation, model training, and evaluation.",
        challenges: [
          "Deciding how to handle missing values in columns that clearly matter for the outcome.",
          "Avoiding overfitting and reading the evaluation honestly instead of tuning to a lucky split."
        ]
      },
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
      role: "Solo — design & build",
      detail: {
        problem:
          "A no-framework exercise in fundamentals: build a clean, genuinely responsive assignment tracker using only hand-written HTML and CSS, then actually ship it.",
        approach:
          "Semantic HTML structure with hand-crafted CSS and a responsive layout that reflows cleanly across device sizes, deployed publicly on Vercel.",
        contribution:
          "Designed and built the full interface and deployed it.",
        challenges: [
          "Making the layout responsive without leaning on a framework or component library.",
          "Keeping the markup semantic and accessible while matching the intended visual design."
        ]
      },
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
