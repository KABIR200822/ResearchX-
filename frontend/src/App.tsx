
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

const API_BASE = "http://127.0.0.1:8002";

type Page =
  | "Overview"
  | "New Research"
  | "Research Library"
  | "Reports"
  | "Evidence Checker";

type ResearchPaper = {
  title?: string;
  authors?: string | string[];
  publication_date?: string;
  date?: string;
  source?: string;
  url?: string;
  abstract?: string;
};

type ResearchResult = {
  project_id?: string | number;
  id?: string | number;
  topic?: string;
  query?: string;
  status?: string;
  content?: string;
  report?: string;
  papers?: ResearchPaper[];
  created_at?: string;
};

type ApiStatus = "checking" | "online" | "offline";

const navigation: {
  label: Page;
  icon: typeof LayoutDashboard;
}[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "New Research", icon: Search },
  { label: "Research Library", icon: BookOpen },
  { label: "Reports", icon: FileText },
  { label: "Evidence Checker", icon: ShieldCheck },
];

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function cleanText(value: string): string {
  return value
    .replace(/\\rev\{([^}]*)\}/g, "$1")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\_/g, "_")
    .trim();
}

function renderInlineMarkdown(text: string) {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    return <span key={index}>{part}</span>;
  });
}

type ReportBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "metadata"; label: string; value: string }
  | { type: "abstract"; value: string }
  | { type: "bullet"; text: string }
  | { type: "separator" };

const metadataLabels = [
  "Research Topic",
  "Generated On",
  "Papers Retrieved",
  "Authors",
  "Publication Date",
  "Source",
  "Research Objectives",
  "Key Findings",
  "Benefits",
  "Limitations",
  "Applications",
  "Research Gaps",
  "Evidence statements checked",
  "Potential conflicts identified",
];

function parseReport(content: string): ReportBlock[] {
  if (!content) return [];

  let normalized = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\rev\{([^}]*)\}/g, "$1");

  // Detect headings even when the backend sends the report as one long line.
  normalized = normalized
    .replace(/\s+(#{1,3}\s+)/g, "\n$1")
    .replace(/(^|\s)(---)(\s|$)/g, "\n---\n");

  // Separate known bold metadata labels.
  const labelsPattern = metadataLabels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  normalized = normalized.replace(
    new RegExp(`\\s+(\\*\\*(?:${labelsPattern}):\\*\\*)`, "gi"),
    "\n$1"
  );

  // Separate inline bullet markers.
  normalized = normalized.replace(/\s+(-\s+)/g, "\n$1");

  const lines = normalized.split("\n");
  const blocks: ReportBlock[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (/^---+$/.test(line)) {
      blocks.push({ type: "separator" });
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      continue;
    }

    const metadata = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);

    if (metadata) {
      const label = metadata[1].trim();
      const value = metadata[2].trim();

      if (label.toLowerCase() === "abstract") {
        blocks.push({ type: "abstract", value });
      } else {
        blocks.push({ type: "metadata", label, value });
      }
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      blocks.push({ type: "bullet", text: bullet[1] });
      continue;
    }

    // Handle bold labels without a colon marker.
    const boldLabel = line.match(/^\*\*(.+?):\*\*$/);

    if (boldLabel) {
      blocks.push({
        type: "metadata",
        label: boldLabel[1],
        value: "",
      });
      continue;
    }

    blocks.push({
      type: "paragraph",
      text: line,
    });
  }

  return blocks;
}

function ReportRenderer({ content }: { content: string }) {
  const blocks = useMemo(() => parseReport(content), [content]);

  if (!content.trim()) {
    return (
      <div className="empty-state">
        <FileText size={34} />
        <h3>No report content available</h3>
        <p>Run a research task to generate a report.</p>
      </div>
    );
  }

  let paperIndex = 0;

  return (
    <div className="report-document">
      {blocks.map((block, index) => {
        if (block.type === "separator") {
          return <hr className="report-divider" key={index} />;
        }

        if (block.type === "heading") {
          const isPaperHeading =
            block.level === 3 &&
            /^\d+\./.test(block.text);

          if (isPaperHeading) paperIndex++;

          return (
            <div
              className={`report-heading report-heading-${block.level}`}
              key={index}
            >
              {isPaperHeading && (
                <span className="paper-number">
                  PAPER {paperIndex}
                </span>
              )}
              {block.level === 1 ? (
                <h1>{renderInlineMarkdown(block.text)}</h1>
              ) : block.level === 2 ? (
                <h2>{renderInlineMarkdown(block.text)}</h2>
              ) : (
                <h3>{renderInlineMarkdown(block.text)}</h3>
              )}
            </div>
          );
        }

        if (block.type === "metadata") {
          return (
            <div className="report-detail-row" key={index}>
              <span className="report-detail-label">
                {block.label}
              </span>
              <span className="report-detail-value">
                {renderInlineMarkdown(block.value || "Not specified")}
              </span>
            </div>
          );
        }

        if (block.type === "abstract") {
          return (
            <div className="report-abstract-card" key={index}>
              <div className="abstract-heading">
                <BookOpen size={15} />
                Abstract
              </div>
              <p>
                {renderInlineMarkdown(block.value || "Abstract not available.")}
              </p>
            </div>
          );
        }

        if (block.type === "bullet") {
          return (
            <div className="report-list-item" key={index}>
              <span className="bullet-dot" />
              <p>{renderInlineMarkdown(block.text)}</p>
            </div>
          );
        }

        return (
          <p className="report-paragraph" key={index}>
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activePage, setActivePage] = useState<Page>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [researchTopic, setResearchTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [researchHistory, setResearchHistory] = useState<ResearchResult[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<ResearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [latestResult, setLatestResult] =
    useState<ResearchResult | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    checkBackend();
    loadHistory();
  }, []);

  async function checkBackend() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) throw new Error("Backend unavailable");
      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch(`${API_BASE}/api/research/history`);
      if (!response.ok) return;

      const data = await response.json();
      const items = Array.isArray(data)
        ? data
        : data.history || data.projects || data.results || [];

      setResearchHistory(items);
    } catch {
      // History remains empty if the endpoint is unavailable.
    }
  }

  async function startResearch() {
    const topic = researchTopic.trim();

    if (!topic) {
      setError("Please enter a research topic first.");
      return;
    }

    setLoading(true);
    setError("");
    setLatestResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          query: topic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Research request failed."
        );
      }

      const result: ResearchResult = {
        ...data,
        topic: data.topic || topic,
        content:
          data.content ||
          data.report ||
          data.report_content ||
          "",
      };

      setLatestResult(result);
      setSelectedReport(result);
      setActivePage("Reports");

      await loadHistory();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the research backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openReport(item: ResearchResult) {
    const id = item.project_id ?? item.id;

    if (id === undefined || id === null) {
      setSelectedReport(item);
      setActivePage("Reports");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/research/${encodeURIComponent(String(id))}`
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedReport({
          ...item,
          ...data,
          content:
            data.content ||
            data.report ||
            data.report_content ||
            item.content ||
            "",
        });
      } else {
        setSelectedReport(item);
      }
    } catch {
      setSelectedReport(item);
    }

    setActivePage("Reports");
  }

  const filteredHistory = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return researchHistory.filter((item) =>
      safeString(item.topic || item.query)
        .toLowerCase()
        .includes(query)
    );
  }, [researchHistory, searchQuery]);

  const totalPapers = useMemo(
    () =>
      researchHistory.reduce(
        (total, item) => total + (item.papers?.length || 0),
        0
      ),
    [researchHistory]
  );

  function navigate(page: Page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  const pageDescription: Record<Page, string> = {
    Overview: "Your research intelligence workspace.",
    "New Research": "Explore academic research with your research pipeline.",
    "Research Library": "Browse your previous research projects.",
    Reports: "Review structured research findings and evidence.",
    "Evidence Checker": "Review evidence verification results.",
  };

  return (
    <div className={`app-shell ${darkMode ? "dark-theme" : "light-theme"}`}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <h2>RESEARCH<span>X</span></h2>
            <p>RESEARCH INTELLIGENCE</p>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => navigate(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activePage === label && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span
              className={`status-dot ${
                apiStatus === "online"
                  ? "online"
                  : apiStatus === "offline"
                  ? "offline"
                  : ""
              }`}
            />
            <div>
              <strong>Backend Status</strong>
              <small>
                {apiStatus === "online"
                  ? "Connected"
                  : apiStatus === "offline"
                  ? "Disconnected"
                  : "Checking..."}
              </small>
            </div>
          </div>

          <div className="sidebar-footer">
            <span>RESEARCHX</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="breadcrumb">
                WORKSPACE <ChevronRight size={12} /> {activePage.toUpperCase()}
              </div>
              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="connection-indicator">
              <span
                className={`status-dot ${
                  apiStatus === "online" ? "online" : "offline"
                }`}
              />
              {apiStatus === "online" ? "System Online" : "System Offline"}
            </div>

            <button
              className="icon-button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="page-container">
          <div className="page-intro">
            <div>
              <p>{pageDescription[activePage]}</p>
            </div>

            {activePage !== "New Research" && (
              <button
                className="secondary-button"
                onClick={() => navigate("New Research")}
              >
                <Search size={16} />
                New Research
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === "Overview" && (
                <div className="page-content">
                  <section className="welcome-banner">
                    <div>
                      <span className="eyebrow">
                        <Activity size={14} /> RESEARCH INTELLIGENCE PLATFORM
                      </span>
                      <h2>Discover. Analyze. Verify.</h2>
                      <p>
                        Turn academic literature into structured research
                        insights with the ResearchX pipeline.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => navigate("New Research")}
                      >
                        Start researching <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="banner-art">
                      <Network size={90} strokeWidth={1} />
                    </div>
                  </section>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <BookOpen size={20} />
                      </div>
                      <span>Research Projects</span>
                      <strong>{researchHistory.length}</strong>
                      <small>Saved projects</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <FileText size={20} />
                      </div>
                      <span>Papers Retrieved</span>
                      <strong>{totalPapers}</strong>
                      <small>From available history</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <ShieldCheck size={20} />
                      </div>
                      <span>Backend</span>
                      <strong className="status-text">
                        {apiStatus === "online" ? "Online" : "Offline"}
                      </strong>
                      <small>API connection</small>
                    </div>
                  </div>

                  <section className="content-card">
                    <div className="section-header">
                      <div>
                        <h3>Recent Research</h3>
                        <p>Your latest research projects</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate("Research Library")}
                      >
                        View all <ArrowRight size={14} />
                      </button>
                    </div>

                    {researchHistory.length === 0 ? (
                      <div className="empty-state">
                        <BookOpen size={30} />
                        <h3>No research projects yet</h3>
                        <p>Start your first research task to see it here.</p>
                      </div>
                    ) : (
                      <div className="history-list">
                        {researchHistory.slice(0, 5).map((item, index) => (
                          <button
                            className="history-row"
                            key={item.project_id ?? item.id ?? index}
                            onClick={() => openReport(item)}
                          >
                            <div className="history-icon">
                              <FileText size={18} />
                            </div>
                            <div className="history-info">
                              <strong>{item.topic || item.query || "Untitled research"}</strong>
                              <small>
                                {item.created_at || "Research project"}
                              </small>
                            </div>
                            <span className="history-status">
                              {item.status || "Available"}
                            </span>
                            <ChevronRight size={17} />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activePage === "New Research" && (
                <div className="page-content">
                  <section className="content-card research-form-card">
                    <div className="card-heading-icon">
                      <Search size={22} />
                    </div>
                    <h2>Start a Research Project</h2>
                    <p>
                      Enter a topic to retrieve and analyze academic research.
                    </p>

                    <label htmlFor="research-topic">Research Topic</label>
                    <textarea
                      id="research-topic"
                      value={researchTopic}
                      onChange={(event) => setResearchTopic(event.target.value)}
                      placeholder="Example: Applications of quantum computing in drug discovery..."
                      rows={5}
                    />

                    {error && <div className="error-message">{error}</div>}

                    <button
                      className="primary-button full-width"
                      onClick={startResearch}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="spin" size={17} />
                          Processing research...
                        </>
                      ) : (
                        <>
                          <Search size={17} />
                          Start Research
                        </>
                      )}
                    </button>

                    <div className="form-note">
                      <AlertTriangle size={14} />
                      Results depend on the backend services currently configured.
                    </div>
                  </section>

                  {latestResult && (
                    <section className="content-card">
                      <h3>Research request completed</h3>
                      <p>{latestResult.topic}</p>
                      <button
                        className="secondary-button"
                        onClick={() => navigate("Reports")}
                      >
                        View report <ArrowRight size={15} />
                      </button>
                    </section>
                  )}
                </div>
              )}

              {activePage === "Research Library" && (
                <section className="content-card">
                  <div className="section-header">
                    <div>
                      <h3>Research Library</h3>
                      <p>All saved research projects</p>
                    </div>
                    <button
                      className="icon-button"
                      onClick={loadHistory}
                      aria-label="Refresh history"
                    >
                      <RefreshCw size={17} />
                    </button>
                  </div>

                  <div className="search-box">
                    <Search size={17} />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search research topics..."
                    />
                  </div>

                  {filteredHistory.length === 0 ? (
                    <div className="empty-state">
                      <BookOpen size={32} />
                      <h3>No matching research found</h3>
                      <p>Try another search or create a new project.</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {filteredHistory.map((item, index) => (
                        <button
                          className="history-row"
                          key={item.project_id ?? item.id ?? index}
                          onClick={() => openReport(item)}
                        >
                          <div className="history-icon">
                            <FileText size={18} />
                          </div>
                          <div className="history-info">
                            <strong>{item.topic || item.query || "Untitled research"}</strong>
                            <small>{item.created_at || "Saved project"}</small>
                          </div>
                          <span className="history-status">
                            {item.status || "Available"}
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activePage === "Reports" && (
                <div className="page-content">
                  {selectedReport ? (
                    <>
                      <div className="report-toolbar">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setSelectedReport(null);
                            navigate("Research Library");
                          }}
                        >
                          <ArrowLeft size={15} /> Back to Library
                        </button>
                        <span className="report-label">
                          <CheckCircle2 size={14} /> RESEARCH REPORT
                        </span>
                      </div>

                      <section className="content-card report-card">
                        <div className="report-top">
                          <span className="eyebrow">
                            RESEARCHX / RESEARCH INTELLIGENCE
                          </span>
                          <h2>
                            {selectedReport.topic ||
                              selectedReport.query ||
                              "Research Report"}
                          </h2>
                          <p>
                            {selectedReport.created_at ||
                              "Generated research report"}
                          </p>
                        </div>

                        <ReportRenderer
                          content={
                            selectedReport.content ||
                            selectedReport.report ||
                            ""
                          }
                        />
                      </section>
                    </>
                  ) : (
                    <section className="content-card">
                      <div className="empty-state">
                        <FileText size={36} />
                        <h3>Select a research report</h3>
                        <p>
                          Open a project from your research library to view
                          its report.
                        </p>
                        <button
                          className="primary-button"
                          onClick={() => navigate("Research Library")}
                        >
                          Open Library <ArrowRight size={15} />
                        </button>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activePage === "Evidence Checker" && (
                <section className="content-card">
                  <div className="card-heading-icon">
                    <ShieldCheck size={22} />
                  </div>
                  <h2>Evidence Verification</h2>
                  <p>
                    Review evidence checks and potential conflicts generated
                    by the research pipeline.
                  </p>

                  <div className="notice-card">
                    <AlertTriangle size={19} />
                    <div>
                      <strong>Verification status depends on backend output</strong>
                      <p>
                        Rule-based screening is not equivalent to complete
                        scientific fact verification. Always review the
                        original papers.
                      </p>
                    </div>
                  </div>

                  {selectedReport ? (
                    <div className="verification-summary">
                      <h3>Selected report</h3>
                      <p>
                        {selectedReport.topic ||
                          selectedReport.query ||
                          "Research project"}
                      </p>
                      <button
                        className="secondary-button"
                        onClick={() => navigate("Reports")}
                      >
                        View report <ArrowRight size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <ShieldCheck size={30} />
                      <h3>No report selected</h3>
                      <p>Open a research report to review its evidence section.</p>
                      <button
                        className="secondary-button"
                        onClick={() => navigate("Research Library")}
                      >
                        Browse library
                      </button>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="app-footer">
            <span>RESEARCHX <span className="footer-dot">●</span> RESEARCH INTELLIGENCE</span>
            <span>Built for deeper discovery.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
