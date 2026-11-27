# ResearchX

<div align="center">

<pre>
██████╗ ███████╗███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝╚██╗██╔╝
██████╔╝█████╗  ███████╗█████╗  ███████║██████╔╝██║      ╚███╔╝
██╔══██╗██╔══╝  ╚════██║██╔══╝  ██╔══██║██╔══██╗██║      ██╔██╗
██║  ██║███████╗███████║███████╗██║  ██║██║  ██║╚██████╗██╔╝ ██╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
</pre>

### From a question to a clearer understanding.

**An agent-based research workspace designed to discover, analyse, verify and synthesise information.**

<br/>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://lucide.dev/"><img src="https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge" alt="Lucide" /></a>
  <a href="#project-status"><img src="https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge" alt="Active development" /></a>
</p>

</div>

---

## Contents

- [Overview](#-overview)
- [The idea](#-the-idea)
- [Research workflow](#-research-workflow)
- [What you can explore](#-what-you-can-explore)
- [Technology](#-technology)
- [Getting started](#-getting-started)
- [Project structure](#-project-structure)
- [Project status](#-project-status)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🔎 Overview

ResearchX is an autonomous-research workspace concept built around a simple principle: **good research should be traceable, structured and open to scrutiny.**

Instead of treating research as a single prompt followed by a single answer, ResearchX is designed as a multi-stage workflow. Specialist agents take on distinct responsibilities — finding material, interpreting it, checking claims and shaping the final output.

The goal is to help users move from scattered information to a clearer picture of what is known, what is disputed and what still needs investigation.

> **Discover. Analyse. Verify. Synthesise.**

## 💡 The idea

Research often means moving between search results, academic papers, documents, notes and drafts. Important context can get lost along the way, and a confident-sounding answer is not necessarily a well-supported one.

ResearchX aims to bring those stages into one connected workspace:

- Start with a research question and define the task.
- Organise the work into focused stages.
- Keep findings connected to their supporting material.
- Make disagreements and limitations visible.
- Turn the collected evidence into a structured report.

ResearchX is intended to assist research — not replace source evaluation or human judgement.

## 🧭 Research workflow

The product is organised around four specialist roles.

| Stage | Agent | Responsibility |
|---|---|---|
| 01 · Discover | **Researcher** | Finds relevant web material, papers and primary sources. |
| 02 · Interpret | **Analyst** | Extracts claims, methods, findings and limitations from the material. |
| 03 · Verify | **Fact-checker** | Compares claims against evidence and flags unsupported or conflicting information. |
| 04 · Deliver | **Report Writer** | Organises the research into a readable report with traceable references. |

### Workflow at a glance

```text
             RESEARCH QUESTION
                     |
                     v
              +-------------+
              |  RESEARCHER |
              |   DISCOVER  |
              +-------------+
                     |
                     v
              +-------------+
              |   ANALYST   |
              |  INTERPRET  |
              +-------------+
                     |
                     v
              +-------------+
              | FACT-CHECKER|
              |   VERIFY    |
              +-------------+
                     |
                     v
              +-------------+
              | REPORT WRITER|
              |  SYNTHESISE |
              +-------------+
                     |
                     v
             STRUCTURED REPORT
          Findings · Sources · Caveats
```

The public repository currently contains the frontend experience and its local interaction prototype. Live research execution and verified source retrieval should only be considered available when the backend services are connected and configured.

## ✨ What you can explore

### Research landing page
A visual introduction to ResearchX, its goals and the research workflow.

### Research workspace
A focused workspace with a prompt composer, research modes, capability starters and a collapsible sidebar.

### Research capabilities
- **Deep Research** — a starting point for multi-stage research tasks.
- **Build** — frame and develop a solution around a problem.
- **Docs** — prepare structured written material.
- **Sheets** — organise information into comparison tables.
- **Slides** — shape research into a presentation outline.

### Workspace organisation
- New research sessions
- Recent conversation entries
- Sidebar search
- Project creation interface
- File selection interface
- Research and Web mode controls
- Model preference selector

### Interface details
- Responsive landing page and workspace layouts
- Interactive dotted background
- Scroll-based section reveals
- Animated navigation and interface transitions
- Research progress preview with four agent stages

## 🧰 Technology

| Technology | Role |
|---|---|
| **React** | Component-based user interface |
| **Vite** | Development server and production bundler |
| **JavaScript (ES Modules)** | Frontend application logic |
| **Tailwind CSS** | Utility-first styling setup |
| **PostCSS** | CSS processing |
| **Lucide React** | Interface icons |
| **GitHub Actions** | Automated GitHub Pages build and deployment |

## 🚀 Getting started

### Prerequisites

- Node.js (22 recommended)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/KABIR200822/ResearchX-.git
cd ResearchX-
```

### 2. Move into the frontend directory

```bash
cd frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will print the local development URL in your terminal (normally `http://localhost:5173`).

### 5. Create a production build

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## 📁 Project structure

```text
ResearchX-/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages deployment workflow
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Landing page and application entry
│   │   ├── Workspace.jsx    # Research workspace interface
│   │   ├── main.jsx         # React bootstrap
│   │   └── style.css        # Application styles
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

## ⚙️ Project status

<sub>Repository snapshot: current public `main` branch.</sub>

ResearchX is under active development. The current public repository provides the React/Vite frontend and an interactive prototype of the research experience.

**Current prototype boundaries**

- Research progress and agent stages are interface previews; they do not, by themselves, represent completed live research.
- The public frontend snapshot does not include a backend service.
- Live web retrieval, model-powered analysis, automatic PDF extraction, source verification and verified citation generation are not currently provided by this frontend alone.
- File selection and workspace interactions should not be mistaken for durable document storage or a complete research pipeline.

These distinctions are intentional: the interface should not present illustrative or mock output as verified research.

## 🗺️ Roadmap

- [x] Build the ResearchX landing page and visual identity
- [x] Create the interactive research workspace
- [x] Add the four-stage agent workflow preview
- [x] Add research modes and capability prompt starters
- [x] Configure automated GitHub Pages deployment
- [ ] Connect the backend research API
- [ ] Add live web and academic source retrieval
- [ ] Implement document ingestion and PDF text extraction
- [ ] Pass structured evidence between agent stages
- [ ] Add source-linked citations and verification details
- [ ] Persist projects, conversations and uploaded documents
- [ ] Generate exportable research reports

## 🤝 Contributing

Contributions, suggestions and issue reports are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and test the frontend build with `npm run build`.
4. Commit your work: `git commit -m "Add: your feature"`.
5. Push the branch and open a pull request.

For substantial changes, open an issue first so the proposed direction can be discussed.

## 📌 Project principles

1. **Evidence over confidence** — conclusions should be supported by inspectable material.
2. **Transparency over black boxes** — make the research process understandable.
3. **Honest status labels** — distinguish previews, generated content and verified findings.
4. **Human judgement stays central** — the tool supports decisions; it does not make them for the researcher.
5. **Incremental development** — build and validate each part before presenting it as complete.

---

<div align="center">

### ResearchX

**A better answer starts with a better research process.**

*Built to follow the evidence.*

</div> shows demo material provenance, and explicitly distinguishes illustrative local content from verified sources. Unsupported topics receive a research brief rather than fabricated findings.
