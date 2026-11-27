import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Atom, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Compass, FileText, FolderOpen, Globe2, Grid2X2, Lightbulb, Mic, Palette, Paperclip, Plus, Search, Send, Sparkles, Table2, X, Zap, PanelLeftClose, PanelLeft, MessageCirclePlus, Smile, Plug, AlarmClock, Presentation, Box, MoreHorizontal, FolderPlus, Download, UserCircle2, CalendarCheck, Library, Orbit } from 'lucide-react';


function InteractiveDotField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, raf = 0;
    let pointer = { x: -1000, y: -1000 };
    let target = { x: -1000, y: -1000 };
    const spacing = 14;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = e => { target.x = e.clientX; target.y = e.clientY; };
    const leave = () => { target.x = -1000; target.y = -1000; };
    const draw = () => {
      pointer.x += (target.x - pointer.x) * 0.16;
      pointer.y += (target.y - pointer.y) * 0.16;
      ctx.clearRect(0, 0, width, height);
      for (let y = 7; y < height; y += spacing) {
        for (let x = 7; x < width; x += spacing) {
          const dx = x - pointer.x, dy = y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - distance / 145);
          const pulse = (Math.sin((x + y) * 0.018 + performance.now() * 0.0007) + 1) * 0.5;
          const alpha = 0.25 + pulse * 0.10 + influence * 0.58;
          const radius = 0.75 + influence * 1.05;
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235,237,244,${alpha})`; ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', leave);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move); window.removeEventListener('blur', leave); };
  }, []);
  return <canvas ref={canvasRef} className="rx-interactive-dot-field" aria-hidden="true" />;
}

const capabilities = [
  { label: 'Deep Research', icon: Search, prompt: 'Research this topic in depth, compare credible sources and produce a cited report.' },
  { label: 'Build', icon: Zap, prompt: 'Help me design and build a solution for this research problem.' },
  { label: 'Docs', icon: FileText, prompt: 'Create a structured research document about: ' },
  { label: 'Sheets', icon: Table2, prompt: 'Organise this research into a comparison table: ' },
  { label: 'Slides', icon: BookOpen, prompt: 'Turn this research into a presentation outline about: ' },
];

function Brand({ compact = false }) {
  return <a className={`rx-brand ${compact ? 'compact' : ''}`} href="#workspace" aria-label="ResearchX home">
    <span className="rx-brand-word">research<span>X</span></span>
  </a>;
}

export default function Workspace() {
  const [query, setQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSearchOpen, setSidebarSearchOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [activeNav, setActiveNav] = useState('New chat');
  const [mode, setMode] = useState('Balanced');
  const [modeOpen, setModeOpen] = useState(false);
  const [taskMode, setTaskMode] = useState('Research');
  const [activeTool, setActiveTool] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [researchResult, setResearchResult] = useState(null);
  const [researchError, setResearchError] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [attached, setAttached] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const fileRef = useRef(null);

  const submit = async () => {
    const question = query.trim();
    if (!question || loading) return;
    setSent(true);
    setLoading(true);
    setResearchResult(null);
    setResearchError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, mode: taskMode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Research request failed. Check that the backend is running.');
      setResearchResult(data);
    } catch (error) {
      setResearchError(error.message || 'Could not connect to the ResearchX API.');
    } finally {
      setLoading(false);
    }
  };
  const chooseCapability = (item) => { setActiveTool(item.label); setQuery(old => old.trim() ? old : item.prompt); };
  const reset = () => { setQuery(''); setSent(false); setActiveTool(''); setAttached([]); setActiveNav('New chat'); };
  const recentChats = ['Hackathon Survival Plan','Research agent architecture','ResearchX landing page','AI research workflow'];
  const openRecent = (title) => { setQuery(title); setSent(true); setActiveNav(title); };

  return <div className={`stitch-workspace ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} id="workspace">
    <InteractiveDotField />
    <aside className="rx-sidebar">
      <div className="rx-sidebar-head">
        <Brand compact/>
        <div className="rx-sidebar-head-actions">
          <button className="rx-sidebar-toggle" title="Search chats" onClick={()=>setSidebarSearchOpen(v=>!v)}><Search size={19}/></button>
          <button className="rx-sidebar-toggle" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?<PanelLeft size={19}/>:<PanelLeftClose size={19}/>}</button>
        </div>
      </div>
      {sidebarSearchOpen && <div className="rx-sidebar-search"><Search size={16}/><input autoFocus value={sidebarSearch} onChange={e=>setSidebarSearch(e.target.value)} placeholder="Search chats"/><button onClick={()=>{setSidebarSearch('');setSidebarSearchOpen(false)}}><X size={14}/></button></div>}
      <button className={`rx-new-chat ${activeNav==='New chat'?'active':''}`} onClick={reset}><FileText size={20}/><span>New chat</span></button>
      <nav className="rx-sidebar-nav">
        <button className={activeNav==='Scheduled'?'selected':''} onClick={()=>{setActiveNav('Scheduled');setShowTips(true)}}><CalendarCheck/><span>Scheduled</span></button>
        <button className={activeNav==='Library'?'selected':''} onClick={()=>{setActiveNav('Library');setShowTips(true)}}><Library/><span>Library</span></button>
        <button className={activeNav==='Plugins'?'selected':''} onClick={()=>{setActiveNav('Plugins');setShowTips(true)}}><Plug/><span>Plugins</span></button>
        <button className={activeNav==='Explore'?'selected':''} onClick={()=>{setActiveNav('Explore');chooseCapability(capabilities[0])}}><Grid2X2/><span>Explore</span></button>
      </nav>
      <div className="rx-sidebar-section rx-project-section">
        <button className="rx-section-heading" onClick={()=>setProjectsExpanded(v=>!v)}><span>Projects</span>{projectsExpanded?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>
        {projectsExpanded && <><button className="rx-project-create" onClick={()=>setProjectOpen(true)}><FolderPlus/><span>New project</span></button>{projectName&&<button className="rx-project-item" onClick={()=>{setActiveNav(projectName);setProjectOpen(false)}}><FolderOpen/><span>{projectName}</span></button>}</>}
      </div>
      <div className="rx-sidebar-section rx-sidebar-chats">
        <span>Recents</span>
        <div className="rx-recent-list">{recentChats.filter(t=>t.toLowerCase().includes(sidebarSearch.toLowerCase())).map(title=><button key={title} className={activeNav===title?'selected':''} onClick={()=>openRecent(title)}>{title}</button>)}</div>
      </div>
      <div className="rx-sidebar-footer"><button className="rx-profile" onClick={()=>setShowTips(v=>!v)}><span className="rx-profile-avatar">M</span><span className="rx-profile-copy"><b>M MOURYA</b><small>Go</small></span></button><button className="rx-download" title="Download desktop app" onClick={()=>setShowTips(v=>!v)}><Download/></button></div>
    </aside>
    <div className="stitch-main-shell">
    <header className="stitch-topbar">
      <nav className="stitch-toplinks">
        <button onClick={() => setShowTips(v => !v)}><BookOpen size={17}/> Docs</button>
        <button onClick={() => setProjectOpen(true)}><Grid2X2 size={17}/> Projects</button>
        <button className="stitch-round" title="Help" onClick={() => setShowTips(v => !v)}><CircleHelp size={18}/></button>
        <span className="stitch-avatar">R</span>
      </nav>
    </header>

    {!sent ? <main className="stitch-home">
      <button className="stitch-announcement" onClick={() => chooseCapability(capabilities[0])}>
        <span className="stitch-new">NEW</span><span>Meet your research workspace — from question to breakthrough</span><b>Explore <ArrowUpRight size={15}/></b>
      </button>
      <div className="stitch-heading-row">
        <div><p className="stitch-eyebrow"><span/> YOUR AUTONOMOUS RESEARCH STUDIO</p><h1>Welcome to <em>ResearchX.</em></h1><p className="stitch-subtitle">What are we discovering today?</p></div>
        <div className="stitch-heading-actions"><button onClick={() => { setTaskMode('Research'); setQuery('Help me explore a new research direction in '); }}><Plus size={16}/> Start with your idea</button><button onClick={reset}><Plus size={16}/> Blank session</button></div>
      </div>

      <section className="stitch-prompt-card">
        <textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Describe what you want to research, compare, understand or create..." rows={3}/>
        {attached.length > 0 && <div className="stitch-attachments">{attached.map((f,i)=><span key={`${f}-${i}`}><Paperclip size={12}/>{f}<button onClick={()=>setAttached(a=>a.filter((_,j)=>i!==j))}><X size={12}/></button></span>)}</div>}
        <div className="stitch-prompt-toolbar">
          <div className="stitch-toolbar-left">
            <button className="stitch-add-btn" title="Attach files" onClick={() => fileRef.current?.click()}><Plus size={21}/></button>
            <input ref={fileRef} type="file" multiple hidden onChange={e=>{const fs=Array.from(e.target.files||[]);setAttached(a=>[...a,...fs.map(f=>f.name)]);}}/>
            <div className="stitch-mode-switch"><button className={taskMode==='Research'?'active':''} onClick={()=>setTaskMode('Research')}><Compass size={15}/> Research</button><button className={taskMode==='Web'?'active':''} onClick={()=>setTaskMode('Web')}><Globe2 size={15}/> Web</button></div>
          </div>
          <div className="stitch-toolbar-right">
            <button className="stitch-tool-icon" title="Style settings" onClick={()=>setShowTips(v=>!v)}><Palette size={17}/></button>
            <div className="stitch-mode-wrap"><button className="stitch-model-select" onClick={()=>setModeOpen(v=>!v)}><Sparkles size={16}/>{mode}<ChevronDown size={14}/></button>{modeOpen&&<div className="stitch-model-menu">{['Balanced','Deep thinking','Fast'].map(m=><button key={m} onClick={()=>{setMode(m);setModeOpen(false)}}>{m}{mode===m&&<Check size={14}/>}</button>)}</div>}</div>
            <button className="stitch-tool-icon" title="Voice input"><Mic size={18}/></button>
            <button className="stitch-submit" disabled={!query.trim()} onClick={submit} title="Start research"><ArrowUpRight size={21}/></button>
          </div>
        </div>
      </section>
      <div className="stitch-under-prompt"><button onClick={()=>setProjectOpen(true)}><FolderOpen size={16}/>{projectName||'Choose a project'}<ChevronDown size={13}/></button><span>ResearchX can make mistakes. Verify important findings.</span></div>

      {showTips && <div className="stitch-tip-panel"><div><Sparkles size={17}/><b>Make your prompt powerful</b></div><p>Tell ResearchX your goal, preferred sources, scope and the format you want back.</p><button onClick={()=>{setQuery('Investigate [topic] using credible primary sources. Compare the strongest findings, note disagreements and limitations, and deliver a cited report with an executive summary.');setShowTips(false)}}>Use a research prompt <ArrowUpRight size={14}/></button></div>}

      <div className="stitch-capabilities-label">START WITH A CAPABILITY</div>
      <div className="stitch-capabilities">{capabilities.map(({label,icon:Icon},i)=><button key={label} className={activeTool===label?'active':''} onClick={()=>chooseCapability(capabilities[i])}><span><Icon size={17}/></span>{label}<ArrowUpRight size={13}/></button>)}</div>
      <div className="stitch-bottom-note"><span className="stitch-orbit"><i/><i/><i/></span><span>Think deeper. Discover more. Build what matters.</span></div>
    </main> : <main className="stitch-results">
      <div className="stitch-results-top">
        <span><Sparkles size={15}/> {loading ? 'RESEARCH IN PROGRESS' : 'RESEARCH SESSION'}</span>
        <button onClick={reset}><Plus size={15}/> New session</button>
      </div>
      <h1>{query}</h1>
      <div className="stitch-progress"><i/><i/><i/><i/></div>
      <div className="stitch-agent-grid">
        {(researchResult?.agents || [
          {name:'Research planner',detail:'Breaking the question into search directions.'},
          {name:'Web researcher',detail:'Searching credible web sources.'},
          {name:'Evidence analyst',detail:'Comparing findings and limitations.'},
          {name:'Report writer',detail:'Preparing a cited report.'},
        ]).map((agent,index) => {
          const icons = [Search, Globe2, Atom, FileText];
          const AgentIcon = icons[index] || FileText;
          return <article key={agent.name} className={agent.status === 'partial' ? 'agent-partial' : ''}>
            <AgentIcon/><b>{agent.name}</b><p>{agent.detail}</p>
            <small>{loading ? 'WORKING…' : agent.status === 'partial' ? 'PARTIAL' : researchResult ? 'COMPLETE' : 'QUEUED'}</small>
          </article>;
        })}
      </div>
      {loading && <p className="stitch-prototype-note">ResearchX is searching sources and preparing your report. This can take a little while.</p>}
      {researchError && <div className="rx-research-error"><b>Research could not be completed</b><p>{researchError}</p><small>Check the backend terminal and your API keys, then try again.</small></div>}
      {researchResult && <section className="rx-research-report">
        <div className="rx-report-heading"><h2>Research report</h2><span>{researchResult.sources.length} sources</span></div>
        <pre>{researchResult.report}</pre>
        <div className="rx-source-list"><h3>Sources</h3>{researchResult.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>[{source.index}] {source.title}</span><ArrowUpRight size={14}/></a>)}</div>
      </section>}
      <div className="stitch-followup"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submit()}} placeholder="Refine your research question..."/><button onClick={submit} disabled={loading || !query.trim()}><Send size={17}/></button></div>
    </main>}

    </div>
    {projectOpen && <div className="stitch-modal-backdrop" onClick={()=>setProjectOpen(false)}><div className="stitch-modal" onClick={e=>e.stopPropagation()}><button className="stitch-modal-close" onClick={()=>setProjectOpen(false)}><X/></button><FolderOpen size={25}/><h2>Choose a project</h2><p>Keep your research, sources and reports organised.</p><input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Enter project name"/><button className="stitch-modal-primary" onClick={()=>setProjectOpen(false)}>Save project</button></div></div>}
  </div>;
}
