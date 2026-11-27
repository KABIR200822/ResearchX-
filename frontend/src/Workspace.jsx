import { useRef, useState } from 'react';
import { ArrowUpRight, Atom, BookOpen, Check, ChevronDown, CircleHelp, Compass, FileText, FolderOpen, Globe2, Grid2X2, Lightbulb, Mic, Palette, Paperclip, Plus, Search, Send, Sparkles, Table2, X, Zap, PanelLeftClose, MessageCirclePlus, Smile, Plug, AlarmClock, Presentation, Box, MoreHorizontal, FolderPlus, Download, UserCircle2 } from 'lucide-react';

const capabilities = [
  { label: 'Deep Research', icon: Search, prompt: 'Research this topic in depth, compare credible sources and produce a cited report.' },
  { label: 'Build', icon: Zap, prompt: 'Help me design and build a solution for this research problem.' },
  { label: 'Docs', icon: FileText, prompt: 'Create a structured research document about: ' },
  { label: 'Sheets', icon: Table2, prompt: 'Organise this research into a comparison table: ' },
  { label: 'Slides', icon: BookOpen, prompt: 'Turn this research into a presentation outline about: ' },
];

function Brand({ compact = false }) {
  return <a className={`rx-brand ${compact ? 'compact' : ''}`} href="#workspace" aria-label="ResearchX home">
    <span className="rx-brand-symbol"><span/><i/><b/></span>
    <span className="rx-brand-word">research<span>X</span></span>
  </a>;
}

export default function Workspace() {
  const [query, setQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('Balanced');
  const [modeOpen, setModeOpen] = useState(false);
  const [taskMode, setTaskMode] = useState('Research');
  const [activeTool, setActiveTool] = useState('');
  const [sent, setSent] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [attached, setAttached] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const fileRef = useRef(null);

  const submit = () => { if (query.trim()) setSent(true); };
  const chooseCapability = (item) => { setActiveTool(item.label); setQuery(old => old.trim() ? old : item.prompt); };
  const reset = () => { setQuery(''); setSent(false); setActiveTool(''); setAttached([]); };

  return <div className={`stitch-workspace ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} id="workspace">
    <aside className="rx-sidebar">
      <div className="rx-sidebar-head"><Brand compact/><button className="rx-sidebar-toggle" title="Collapse sidebar" onClick={()=>setSidebarCollapsed(v=>!v)}><PanelLeftClose size={19}/></button></div>
      <button className="rx-new-chat" onClick={reset}><MessageCirclePlus size={19}/><span>New chat</span><kbd>⌘</kbd><kbd>K</kbd></button>
      <nav className="rx-sidebar-nav">
        <button onClick={()=>setShowTips(v=>!v)}><Smile/><span>My Research</span></button>
        <button onClick={()=>setShowTips(v=>!v)}><Plug/><span>Plugins</span></button>
        <button onClick={()=>setShowTips(v=>!v)}><AlarmClock/><span>Task Center</span></button>
        <button onClick={()=>chooseCapability(capabilities[0])}><Lightbulb/><span>Inspiration</span></button>
        <button onClick={()=>chooseCapability(capabilities[4])}><Presentation/><span>Slides</span></button>
        <button onClick={()=>chooseCapability(capabilities[1])}><Box/><span>Build</span><i>New</i></button>
        <button onClick={()=>setShowTips(v=>!v)}><MoreHorizontal/><span>More</span></button>
      </nav>
      <div className="rx-sidebar-section"><span>Projects</span><button onClick={()=>setProjectOpen(true)}><FolderPlus/><span>New project</span></button></div>
      <div className="rx-sidebar-section rx-sidebar-chats"><span>Chats</span><p>Start a new chat to see your research history here.</p></div>
      <div className="rx-sidebar-footer"><button onClick={()=>setShowTips(v=>!v)}><UserCircle2/><span>Log in</span></button><button className="rx-download" title="Download"><Download/></button></div>
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
        <textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Describe what you want to research, compare, understand or create..." rows={4}/>
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
      <div className="stitch-results-top"><span><Sparkles size={15}/> RESEARCH SESSION</span><button onClick={reset}><Plus size={15}/> New session</button></div>
      <h1>{query}</h1><div className="stitch-progress"><i/><i/><i/><i/></div>
      <div className="stitch-agent-grid"><article><Search/><b>Researcher</b><p>Discovering relevant academic and web sources</p><small>01 · DISCOVER</small></article><article><BookOpen/><b>Analyst</b><p>Extracting findings, methods and limitations</p><small>02 · ANALYSE</small></article><article><Atom/><b>Fact-checker</b><p>Cross-checking evidence and contradictions</p><small>03 · VERIFY</small></article><article><FileText/><b>Report writer</b><p>Preparing a structured, cited report</p><small>04 · SYNTHESISE</small></article></div>
      <p className="stitch-prototype-note">This is a frontend interaction preview. Connect your research APIs to enable live agent execution.</p><div className="stitch-followup"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Refine your research question..."/><button onClick={submit}><Send size={17}/></button></div>
    </main>}

    </div>
    {projectOpen && <div className="stitch-modal-backdrop" onClick={()=>setProjectOpen(false)}><div className="stitch-modal" onClick={e=>e.stopPropagation()}><button className="stitch-modal-close" onClick={()=>setProjectOpen(false)}><X/></button><FolderOpen size={25}/><h2>Choose a project</h2><p>Keep your research, sources and reports organised.</p><input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Enter project name"/><button className="stitch-modal-primary" onClick={()=>setProjectOpen(false)}>Save project</button></div></div>}
  </div>;
}
