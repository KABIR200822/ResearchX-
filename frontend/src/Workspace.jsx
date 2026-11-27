import { useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, ChevronDown, Compass, Globe2, Paperclip, Plus, Send, Sparkles, X, PanelLeftClose, MessageCirclePlus } from 'lucide-react';

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
  const [sent, setSent] = useState(false);
  const [attached, setAttached] = useState([]);
  const fileRef = useRef(null);

  const submit = () => { if (query.trim()) setSent(true); };
  const reset = () => { setQuery(''); setSent(false); setAttached([]); };

  return <div className={`stitch-workspace ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} id="workspace">
    <aside className="rx-sidebar">
      <div className="rx-sidebar-head">
        <Brand compact/>
        <button className="rx-sidebar-toggle" title="Collapse sidebar" onClick={() => setSidebarCollapsed(v => !v)}><PanelLeftClose size={19}/></button>
      </div>
      <button className="rx-new-chat" onClick={reset}><MessageCirclePlus size={19}/><span>New chat</span></button>
    </aside>

    <div className="stitch-main-shell">
      <header className="stitch-topbar">
        <nav className="stitch-toplinks">
          <span className="stitch-avatar">R</span>
        </nav>
      </header>

      {!sent ? <main className="stitch-home">
        <div className="stitch-heading-row">
          <div>
            <p className="stitch-eyebrow"><span/> YOUR AUTONOMOUS RESEARCH STUDIO</p>
            <h1>Welcome to <em>ResearchX.</em></h1>
            <p className="stitch-subtitle">What are we discovering today?</p>
          </div>
        </div>

        <section className="stitch-prompt-card">
          <textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Describe what you want to research, compare, understand or create..." rows={4}/>
          {attached.length > 0 && <div className="stitch-attachments">{attached.map((f,i)=><span key={`${f}-${i}`}><Paperclip size={12}/>{f}<button onClick={() => setAttached(a => a.filter((_,j) => i !== j))}><X size={12}/></button></span>)}</div>}
          <div className="stitch-prompt-toolbar">
            <div className="stitch-toolbar-left">
              <button className="stitch-add-btn" title="Attach files" onClick={() => fileRef.current?.click()}><Plus size={21}/></button>
              <input ref={fileRef} type="file" multiple hidden onChange={e => { const fs = Array.from(e.target.files || []); setAttached(a => [...a, ...fs.map(f => f.name)]); }}/>
              <div className="stitch-mode-switch">
                <button className={taskMode === 'Research' ? 'active' : ''} onClick={() => setTaskMode('Research')}><Compass size={15}/> Research</button>
                <button className={taskMode === 'Web' ? 'active' : ''} onClick={() => setTaskMode('Web')}><Globe2 size={15}/> Web</button>
              </div>
            </div>
            <div className="stitch-toolbar-right">
              <div className="stitch-mode-wrap">
                <button className="stitch-model-select" onClick={() => setModeOpen(v => !v)}><Sparkles size={16}/>{mode}<ChevronDown size={14}/></button>
                {modeOpen && <div className="stitch-model-menu">{['Balanced','Deep thinking','Fast'].map(m => <button key={m} onClick={() => { setMode(m); setModeOpen(false); }}>{m}{mode === m && <Check size={14}/>}</button>)}</div>}
              </div>
              <button className="stitch-submit" disabled={!query.trim()} onClick={submit} title="Start research"><ArrowUpRight size={21}/></button>
            </div>
          </div>
        </section>
      </main> : <main className="stitch-results">
        <div className="stitch-results-top"><span><Sparkles size={15}/> RESEARCH SESSION</span><button onClick={reset}><Plus size={15}/> New session</button></div>
        <h1>{query}</h1>
        <div className="stitch-progress"><i/><i/><i/><i/></div>
        <div className="stitch-agent-grid">
          <article><BookOpen/><b>Researcher</b><p>Discovering relevant academic and web sources</p><small>01 · DISCOVER</small></article>
          <article><BookOpen/><b>Analyst</b><p>Extracting findings, methods and limitations</p><small>02 · ANALYSE</small></article>
          <article><Sparkles/><b>Fact-checker</b><p>Cross-checking evidence and contradictions</p><small>03 · VERIFY</small></article>
          <article><BookOpen/><b>Report writer</b><p>Preparing a structured, cited report</p><small>04 · SYNTHESISE</small></article>
        </div>
        <p className="stitch-prototype-note">This is a frontend interaction preview. Connect your research APIs to enable live agent execution.</p>
        <div className="stitch-followup"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Refine your research question..."/><button onClick={submit}><Send size={17}/></button></div>
      </main>}
    </div>
  </div>;
}
