import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Atom, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Compass, FileText, FolderOpen, Globe2, Grid2X2, Lightbulb, Mic, Palette, Paperclip, Plus, Search, Send, Sparkles, Table2, X, Zap, PanelLeftClose, PanelLeft, MessageCirclePlus, Smile, Plug, AlarmClock, Presentation, Box, MoreHorizontal, FolderPlus, Download, UserCircle2, CalendarCheck, Library, Orbit, Eye, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';


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

function ResearchReportPreview({ topic, reportRef }) {
  const safeTopic = topic || 'Your research topic';
  const sections = [
    { n: '01', title: 'Define the scope', body: `Clarify the central question, timeframe, geography and key terms for “${safeTopic}”.` },
    { n: '02', title: 'Compare the evidence', body: 'Separate primary evidence from commentary, compare methods and identify where credible sources agree or differ.' },
    { n: '03', title: 'Evaluate limitations', body: 'Check sample sizes, dates, assumptions, conflicts of interest and gaps before drawing conclusions.' },
  ];
  return <section className="rx-report-preview" ref={reportRef}>
    <div className="rx-report-heading"><div><span className="rx-report-kicker"><FileText size={14}/> RESEARCH REPORT · PREVIEW</span><h2>{safeTopic}</h2><p>This is a structured report preview. No external sources have been retrieved or verified yet.</p></div><span className="rx-report-status">DEMO</span></div>
    <div className="rx-report-summary"><span>EXECUTIVE SUMMARY</span><p>ResearchX has organised this question into a research plan. The next stage is to retrieve trustworthy evidence, assess its quality and synthesise findings with traceable citations.</p></div>
    <div className="rx-report-section-title"><h3>Research approach</h3><span>3 planned steps</span></div>
    <div className="rx-report-findings">{sections.map(item=><article key={item.n}><span>{item.n}</span><div><b>{item.title}</b><p>{item.body}</p></div></article>)}</div>
    <div className="rx-report-section-title"><h3>Sources & citations</h3><span>Awaiting retrieval</span></div>
    <div className="rx-source-empty"><div className="rx-source-icon"><BookOpen size={19}/></div><div><b>No verified sources yet</b><p>Source cards and numbered citations will appear here after live web search is connected. We won't invent references or present placeholders as evidence.</p></div></div>
    <div className="rx-report-footer"><span><Check size={14}/> Report structure generated</span><span>Evidence verification pending</span></div>
  </section>;
}


function ResearchWorkspaceTabs({ attached = [] }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [evidenceItems, setEvidenceItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('researchx-evidence-items') || '[]'); } catch { return []; }
  });
  const [claimDraft, setClaimDraft] = useState('');
  const [sourceDraft, setSourceDraft] = useState('');
  const [stanceDraft, setStanceDraft] = useState('supports');
  const [noteDraft, setNoteDraft] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  useEffect(() => {
    try { localStorage.setItem('researchx-evidence-items', JSON.stringify(evidenceItems)); } catch { /* Keep working for this session if storage is unavailable. */ }
  }, [evidenceItems]);
  const addEvidence = () => {
    const claim = claimDraft.trim();
    if (!claim) return;
    setEvidenceItems(items => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, claim, source: sourceDraft.trim(), stance: stanceDraft, note: noteDraft.trim(), createdAt: Date.now() }, ...items]);
    setClaimDraft(''); setSourceDraft(''); setNoteDraft(''); setStanceDraft('supports');
  };
  const evidenceCounts = evidenceItems.reduce((counts, item) => { counts[item.stance] = (counts[item.stance] || 0) + 1; return counts; }, {});
  const visibleEvidence = evidenceItems.filter(item => evidenceFilter === 'all' || item.stance === evidenceFilter);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [page, setPage] = useState(1);
  const tabs = [
    { name: 'Overview', icon: Grid2X2 },
    { name: 'Sources', icon: Globe2 },
    { name: 'Papers', icon: FileText },
    { name: 'Findings', icon: Lightbulb },
    { name: 'Verification', icon: Atom },
    { name: 'Report', icon: BookOpen },
  ];
  const openPaper = paper => { setSelectedPaper(paper); setPage(1); };
  return <section className="rx-research-workspace">
    <div className="rx-research-workspace-head"><div><span className="rx-report-kicker"><Orbit size={13}/> RESEARCH WORKSPACE</span><h3>Research materials</h3><p>One place for evidence, papers, findings and the final report.</p></div><span className="rx-preview-pill">FRONTEND PREVIEW</span></div>
    <div className="rx-research-tabs" role="tablist" aria-label="Research workspace sections">
      {tabs.map(({name, icon: Icon}) => <button key={name} role="tab" aria-selected={activeTab===name} className={activeTab===name?'active':''} onClick={()=>setActiveTab(name)}><Icon size={15}/>{name}{name==='Papers'&&attached.length>0&&<span className="rx-tab-count">{attached.length}</span>}</button>)}
    </div>
    <div className="rx-research-tab-panel" role="tabpanel">
      {activeTab==='Overview'&&<div className="rx-overview-grid"><article><span>01</span><b>Gather evidence</b><p>Collect independent web sources and research papers for the question.</p></article><article><span>02</span><b>Analyse findings</b><p>Extract important claims, results, methods and limitations.</p></article><article><span>03</span><b>Verify & synthesise</b><p>Compare evidence before preparing a traceable report.</p></article></div>}
      {activeTab==='Sources'&&<div className="rx-tab-empty"><Globe2/><div><b>No web sources retrieved</b><p>Live search is not connected yet. When enabled, retrieved sources will appear here with titles, domains, dates and links.</p></div><span>0 SOURCES</span></div>}
      {activeTab==='Papers'&&<div className="rx-paper-list">{attached.length?attached.map((paper)=><div className="rx-paper-row" key={paper.id}><span className="rx-paper-icon"><FileText size={17}/></span><div><b>{paper.name}</b><p>PDF · {formatFileSize(paper.size)} · Added {new Date(paper.lastModified).toLocaleDateString()}</p></div><button className="rx-paper-view" onClick={()=>openPaper(paper)}><Eye size={14}/> Open paper</button></div>):<div className="rx-tab-empty"><FileText/><div><b>No papers attached</b><p>Use the paperclip button in the prompt composer to add PDF research papers to this session.</p></div><span>0 PAPERS</span></div>}</div>}
      {activeTab==='Findings'&&<div className="rx-evidence-explorer">
        <div className="rx-evidence-intro"><div><b>Evidence & findings register</b><p>Capture claims from papers or sources, then label how each piece of evidence relates to the claim.</p></div><span>{evidenceItems.length} ENTRIES</span></div>
        <div className="rx-evidence-form"><label>Finding or claim<input value={claimDraft} onChange={e=>setClaimDraft(e.target.value)} placeholder="e.g. The study reports improved model accuracy…" onKeyDown={e=>{if(e.key==='Enter') addEvidence();}} /></label><div className="rx-evidence-form-row"><label>Source / paper reference<input value={sourceDraft} onChange={e=>setSourceDraft(e.target.value)} placeholder="Paper title, URL or page number" /></label><label>Evidence stance<select value={stanceDraft} onChange={e=>setStanceDraft(e.target.value)}><option value="supports">Supports claim</option><option value="contradicts">Contradicts claim</option><option value="context">Adds context</option></select></label></div><label>Notes (optional)<textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} placeholder="Method, sample, statistic, limitation…" rows="2" /></label><div className="rx-evidence-form-actions"><small>Manually captured · Not independently verified by ResearchX</small><button onClick={addEvidence} disabled={!claimDraft.trim()}><Plus size={14}/> Add evidence</button></div></div>
        <div className="rx-evidence-list-head"><b>Captured evidence</b><select value={evidenceFilter} onChange={e=>setEvidenceFilter(e.target.value)} aria-label="Filter evidence"><option value="all">All evidence</option><option value="supports">Supports</option><option value="contradicts">Contradicts</option><option value="context">Context</option></select></div>
        {visibleEvidence.length ? <div className="rx-evidence-list">{visibleEvidence.map(item=><article className="rx-evidence-card" key={item.id}><div className="rx-evidence-card-top"><span className={`rx-evidence-stance ${item.stance}`}>{item.stance==='supports'?'SUPPORTS':item.stance==='contradicts'?'CONTRADICTS':'CONTEXT'}</span><button title="Remove evidence entry" aria-label="Remove evidence entry" onClick={()=>setEvidenceItems(items=>items.filter(entry=>entry.id!==item.id))}><X size={14}/></button></div><b>{item.claim}</b>{item.source&&<p className="rx-evidence-source"><FileText size={12}/>{item.source}</p>}{item.note&&<p className="rx-evidence-note">{item.note}</p>}</article>)}</div> : <div className="rx-tab-empty"><Lightbulb/><div><b>{evidenceItems.length?'No entries match this filter':'No findings captured yet'}</b><p>Add claims and their source references above. Once search and document analysis are connected, this register can be populated automatically.</p></div><span>EMPTY REGISTER</span></div>}
      </div>}
      {activeTab==='Verification'&&<div className="rx-evidence-verification"><div className="rx-verification-grid"><article><span className="rx-verification-dot pending"/><b>Supporting entries</b><p>{evidenceCounts.supports || 0} captured</p></article><article><span className="rx-verification-dot pending"/><b>Contradicting entries</b><p>{evidenceCounts.contradicts || 0} captured</p></article><article><span className="rx-verification-dot pending"/><b>Contextual entries</b><p>{evidenceCounts.context || 0} captured</p></article></div><div className="rx-verification-guidance"><Atom size={17}/><div><b>Evidence comparison is a manual workspace at this stage</b><p>Entries are counted by stance, but ResearchX does not yet determine whether claims genuinely conflict. Automated claim matching, source-quality scoring and contradiction analysis will be connected with the research engine.</p></div></div>{evidenceItems.length>0&&<button className="rx-verification-open" onClick={()=>setActiveTab('Findings')}>Review captured evidence <ChevronRight size={14}/></button>}</div>}
      {activeTab==='Report'&&<ResearchReportBuilder evidenceItems={evidenceItems} />}
    </div>
    {selectedPaper&&<div className="rx-pdf-modal-backdrop" onClick={()=>setSelectedPaper(null)}><section className="rx-pdf-modal" role="dialog" aria-modal="true" aria-label={`PDF viewer: ${selectedPaper.name}`} onClick={e=>e.stopPropagation()}>
      <header className="rx-pdf-modal-head"><div className="rx-pdf-file-meta"><span className="rx-paper-icon"><FileText size={17}/></span><div><b>{selectedPaper.name}</b><small>{formatFileSize(selectedPaper.size)} · PDF document</small></div></div><button onClick={()=>setSelectedPaper(null)} aria-label="Close PDF viewer"><X size={19}/></button></header>
      <div className="rx-pdf-toolbar"><div className="rx-pdf-page-controls"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} aria-label="Previous page"><ChevronLeft size={16}/></button><span>Page</span><input aria-label="PDF page number" type="number" min="1" value={page} onChange={e=>setPage(Math.max(1,Number(e.target.value)||1))}/><button onClick={()=>setPage(p=>p+1)} aria-label="Next page"><ChevronRightIcon size={16}/></button><small>Use the PDF viewer to see the total page count.</small></div><a href={selectedPaper.url} download={selectedPaper.name}><Download size={14}/> Download</a></div>
      <div className="rx-pdf-viewer"><iframe title={`PDF preview of ${selectedPaper.name}`} src={`${selectedPaper.url}#page=${page}&toolbar=0`} /></div>
      <footer className="rx-pdf-modal-foot">Local PDF preview · Text extraction and AI paper analysis will be enabled when the backend is connected.</footer>
    </section></div>}
  </section>;
}

function ResearchReportBuilder({ evidenceItems = [] }) {
  const counts = evidenceItems.reduce((acc, item) => { acc[item.stance] = (acc[item.stance] || 0) + 1; return acc; }, {});
  const exportReport = () => {
    const lines = ['# ResearchX Research Report', '', '> FRONTEND PREVIEW — manually entered evidence only. No live sources have been retrieved or independently verified.', '', '## Executive summary', 'This report organises the evidence currently captured in this ResearchX workspace. Conclusions should remain provisional until source retrieval and verification are connected.', '', '## Key findings', ...(evidenceItems.length ? evidenceItems.map((item, i) => `${i + 1}. **${item.claim}**\n   - Evidence stance: ${item.stance}\n   - Source: ${item.source || 'Not supplied'}\n   - Notes: ${item.note || 'None'}`) : ['No findings have been captured yet.']), '', '## Evidence balance', `- Supports: ${counts.supports || 0}`, `- Contradicts: ${counts.contradicts || 0}`, `- Context: ${counts.context || 0}`, '', '## Limitations', '- Evidence entries are manually captured.', '- Source authenticity, methodology and claim accuracy have not been independently checked.', '- Automated contradiction analysis and verified citations are not connected yet.', '', '## References', ...(evidenceItems.filter(x => x.source).map((item, i) => `${i + 1}. ${item.source}`) || ['No references supplied.'])].join('\n');
    const blob = new Blob([lines], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'researchx-report-preview.md'; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="rx-report-builder">
    <div className="rx-report-builder-toolbar"><div><span className="rx-report-kicker"><FileText size={14}/> REPORT STUDIO</span><h3>Research report preview</h3><p>A polished report layout populated from the evidence you have manually captured.</p></div><button onClick={exportReport}><Download size={14}/> Export Markdown</button></div>
    <article className="rx-report-paper">
      <header className="rx-report-paper-head"><div className="rx-report-paper-brand">research<span>X</span><small>RESEARCH INTELLIGENCE</small></div><span className="rx-report-status">PREVIEW</span></header>
      <div className="rx-report-paper-title"><span>RESEARCH DOSSIER · {new Date().toLocaleDateString()}</span><h2>Research findings & evidence synthesis</h2><p>Prepared in ResearchX · Evidence-led report template</p></div>
      <div className="rx-report-paper-callout"><b>Executive summary</b><p>This report brings together {evidenceItems.length} manually captured evidence {evidenceItems.length===1?'entry':'entries'}. It organises the current findings and their stated relationship to the claims. This is not an AI-generated conclusion: live retrieval, source verification and automated synthesis have not yet been connected.</p></div>
      <div className="rx-report-metrics"><div><strong>{evidenceItems.length}</strong><span>Evidence entries</span></div><div><strong>{counts.supports||0}</strong><span>Supporting</span></div><div><strong>{counts.contradicts||0}</strong><span>Contradicting</span></div><div><strong>{counts.context||0}</strong><span>Contextual</span></div></div>
      <section className="rx-report-paper-section"><div className="rx-report-paper-section-head"><span>01</span><h4>Key findings</h4></div>{evidenceItems.length ? <div className="rx-report-paper-findings">{evidenceItems.map((item,i)=><article key={item.id}><div className="rx-report-finding-index">F{i+1}</div><div><b>{item.claim}</b><p>{item.note || 'No supporting notes have been added for this entry.'}</p><div className="rx-report-finding-meta"><span className={`rx-evidence-stance ${item.stance}`}>{item.stance==='supports'?'SUPPORTS':item.stance==='contradicts'?'CONTRADICTS':'CONTEXT'}</span><small>{item.source || 'Source not supplied'}</small></div></div></article>)}</div> : <div className="rx-report-placeholder"><Lightbulb size={18}/><div><b>Your findings will appear here</b><p>Add claims in the Findings tab. The report will reflect those entries automatically.</p></div></div>}</section>
      <section className="rx-report-paper-section"><div className="rx-report-paper-section-head"><span>02</span><h4>Cross-verification overview</h4></div><p className="rx-report-paper-copy">The current evidence register contains {counts.supports||0} entries labelled as supporting, {counts.contradicts||0} labelled as contradicting and {counts.context||0} labelled as contextual. These are user-assigned labels, not automated verification results. ResearchX has not yet determined whether any claims genuinely conflict.</p></section>
      <section className="rx-report-paper-section"><div className="rx-report-paper-section-head"><span>03</span><h4>Methodology & limitations</h4></div><ul><li>Evidence is entered manually by the user.</li><li>Sources have not been independently authenticated.</li><li>Differences in sample, date, geography and methodology have not been assessed.</li><li>Automated paper extraction, web retrieval and citation validation are pending backend integration.</li></ul></section>
      <section className="rx-report-paper-section"><div className="rx-report-paper-section-head"><span>04</span><h4>References</h4></div>{evidenceItems.filter(x=>x.source).length ? <ol>{evidenceItems.filter(x=>x.source).map((item,i)=><li key={item.id}>{item.source}</li>)}</ol> : <div className="rx-report-placeholder compact">No source references have been supplied yet.</div>}</section>
      <footer className="rx-report-paper-foot"><span>researchX · Evidence first. Conclusions with care.</span><span>Preview document · Not verified</span></footer>
    </article>
    <div className="rx-report-integrity-note"><Check size={15}/><span>Report updates automatically when you add or remove entries in the Findings tab. Sample claims and invented citations are not inserted.</span></div>
  </div>;
}


function formatFileSize(bytes=0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/(1024*1024)).toFixed(2)} MB`;
}

export default function Workspace() {
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('researchx-conversations') || '[]'); }
    catch { return []; }
  });
  const [activeConversationId, setActiveConversationId] = useState(null);
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
  const [messages, setMessages] = useState([]);
  const [researchStage, setResearchStage] = useState(0);
  const [isResearching, setIsResearching] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [attached, setAttached] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const fileRef = useRef(null);
  const attachedUrls = useRef(new Set());
  const resultsRef = useRef(null);
  const agentGridRef = useRef(null);
  const reportRef = useRef(null);
  useEffect(() => () => { attachedUrls.current.forEach(url => URL.revokeObjectURL(url)); }, []);

  useEffect(() => {
    try { localStorage.setItem('researchx-conversations', JSON.stringify(conversations)); }
    catch { /* Storage may be unavailable; the workspace still works for this session. */ }
  }, [conversations]);

  const submit = () => {
    const prompt = query.trim();
    if (!prompt || isResearching) return;
    const id = activeConversationId || `${Date.now()}`;
    const existing = conversations.find(item => item.id === id);
    const nextMessages = [...messages, { role: 'user', content: prompt, createdAt: Date.now() }];
    const conversation = { id, title: existing?.title || prompt.slice(0, 54), prompt, messages: nextMessages, updatedAt: Date.now() };
    setConversations(items => [conversation, ...items.filter(item => item.id !== id)].slice(0, 30));
    setActiveConversationId(id);
    setMessages(nextMessages);
    setQuery('');
    setSent(true);
    setResearchStage(0);
    setIsResearching(true);
  };

  useEffect(() => {
    if (!isResearching) return;
    const timer = window.setInterval(() => {
      setResearchStage(stage => {
        if (stage >= 4) {
          window.clearInterval(timer);
          return 4;
        }
        return stage + 1;
      });
    }, 1250);
    return () => window.clearInterval(timer);
  }, [isResearching]);

  // Keep the active research step in view as the workflow progresses.
  useEffect(() => {
    if (!isResearching || !agentGridRef.current) return;
    const activeCard = agentGridRef.current.querySelector('.is-active');
    if (activeCard) {
      window.requestAnimationFrame(() => activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }, [isResearching, researchStage]);

  // When generation finishes, bring the generated report back into view.
  useEffect(() => {
    if (isResearching || !sent || !messages.some(message => message.role === 'assistant')) return;
    const timer = window.setTimeout(() => {
      if (reportRef.current) reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isResearching, sent, messages]);

  useEffect(() => {
    if (!isResearching || researchStage < 4) return;
    const timer = window.setTimeout(() => {
      const latestUser = [...messages].reverse().find(message => message.role === 'user');
      const response = {
        role: 'assistant',
        content: `Research plan prepared for “${latestUser?.content || 'your question'}”.`,
        topic: latestUser?.content || 'Your research topic',
        createdAt: Date.now(),
      };
      const updated = [...messages, response];
      setMessages(updated);
      setConversations(items => items.map(item => item.id === activeConversationId ? { ...item, messages: updated, updatedAt: Date.now() } : item));
      setIsResearching(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [isResearching, researchStage]);
  const chooseCapability = (item) => { setActiveTool(item.label); setQuery(old => old.trim() ? old : item.prompt); };
  const reset = () => { attached.forEach(paper => { URL.revokeObjectURL(paper.url); attachedUrls.current.delete(paper.url); }); setQuery(''); setSent(false); setMessages([]); setResearchStage(0); setIsResearching(false); setActiveTool(''); setAttached([]); setActiveNav('New chat'); setActiveConversationId(null); setModeOpen(false); };
  const openRecent = (item) => { setQuery(''); setMessages(item.messages || [{ role: 'user', content: item.prompt || item.title }]); setSent(true); setResearchStage(4); setIsResearching(false); setActiveNav(item.title); setActiveConversationId(item.id); };

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
        <div className="rx-recent-list">{conversations.filter(item=>item.title.toLowerCase().includes(sidebarSearch.toLowerCase())).map(item=><button key={item.id} className={activeConversationId===item.id?'selected':''} onClick={()=>openRecent(item)}>{item.title}</button>)}{conversations.length===0&&<p className="rx-empty-history">Your conversations will appear here.</p>}</div>
      </div>
      <div className="rx-sidebar-footer"><button className="rx-profile" onClick={()=>setShowTips(v=>!v)}><span className="rx-profile-avatar">M</span><span className="rx-profile-copy"><b>M MOURYA</b><small>Go</small></span></button><button className="rx-download" title="Download desktop app" onClick={()=>setShowTips(v=>!v)}><Download/></button></div>
    </aside>
    <button className={`rx-sidebar-reopen ${sidebarCollapsed ? 'visible' : ''}`} title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'} aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'} onClick={()=>setSidebarCollapsed(v=>!v)}><PanelLeft size={19}/></button>
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
        {attached.length > 0 && <div className="stitch-attachments">{attached.map((paper,i)=><span key={paper.id}><Paperclip size={12}/>{paper.name}<button onClick={()=>{URL.revokeObjectURL(paper.url);attachedUrls.current.delete(paper.url);setAttached(a=>a.filter((_,j)=>i!==j))}}><X size={12}/></button></span>)}</div>}
        <div className="stitch-prompt-toolbar">
          <div className="stitch-toolbar-left">
            <button className="stitch-add-btn" title="Attach files" onClick={() => fileRef.current?.click()}><Plus size={21}/></button>
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={e=>{const fs=Array.from(e.target.files||[]);const pdfs=fs.filter(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));setAttached(a=>[...a,...pdfs.map(file=>{const url=URL.createObjectURL(file);attachedUrls.current.add(url);return {id:`${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,file,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified,url};})]);e.target.value='';}}/>
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
    </main> : <main className="stitch-results" ref={resultsRef}>
      <div className="stitch-results-top"><span><Sparkles size={15}/> RESEARCH SESSION</span><button onClick={reset}><Plus size={15}/> New session</button></div>
      <div className="rx-session-thread">{messages.map((message, index) => <article className={`rx-chat-message ${message.role}`} key={`${message.createdAt || index}-${index}`}><span className="rx-message-avatar">{message.role === 'user' ? 'R' : <Sparkles size={15}/>}</span><div><small>{message.role === 'user' ? 'YOU' : 'RESEARCHX'}</small><p>{message.content}</p>{message.role === 'assistant' && <ResearchReportPreview reportRef={reportRef} topic={message.topic || message.content.replace(/^Research plan prepared for “|”\.$/g, '')}/>}</div></article>)}</div>
      {isResearching && <><div className="stitch-progress"><i/><i/><i/><i/></div><div className="stitch-agent-grid" ref={agentGridRef}>{[{icon:Search,name:'Researcher',desc:'Mapping the question and identifying useful source types',stage:'01 · DISCOVER'},{icon:BookOpen,name:'Analyst',desc:'Planning how findings and limitations will be compared',stage:'02 · ANALYSE'},{icon:Atom,name:'Fact-checker',desc:'Preparing evidence checks and contradiction review',stage:'03 · VERIFY'},{icon:FileText,name:'Report writer',desc:'Organising the final report structure',stage:'04 · SYNTHESISE'}].map((agent,index)=>{const Icon=agent.icon;const done=researchStage>index;const active=researchStage===index;return <article className={`${done?'is-done':''} ${active?'is-active':''}`} key={agent.name}><div className="rx-agent-status">{done?<Check size={15}/>:active?<span className="rx-agent-spinner"/>:<Icon size={17}/>}</div><b>{agent.name}</b><p>{agent.desc}</p><small>{agent.stage} · {done?'COMPLETE':active?'WORKING':'QUEUED'}</small></article>})}</div><p className="stitch-prototype-note">Interactive workflow preview · Live search, source retrieval and citation verification will be connected in the backend phase.</p></>}
      {!isResearching && messages.some(message=>message.role==='assistant') && <div className="rx-report-actions"><span><Check size={14}/> Preview response ready</span><button onClick={()=>{const last=messages.filter(m=>m.role==='assistant').at(-1);if(last)navigator.clipboard?.writeText(last.content)}}>Copy response</button></div>}
      {!isResearching && messages.some(message=>message.role==='assistant') && <ResearchWorkspaceTabs attached={attached}/>}
      <div className="stitch-followup"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit()}}} placeholder="Ask a follow-up or refine your research..."/><button disabled={!query.trim()||isResearching} onClick={submit}><Send size={17}/></button></div>
    </main>}

    </div>
    {projectOpen && <div className="stitch-modal-backdrop" onClick={()=>setProjectOpen(false)}><div className="stitch-modal" onClick={e=>e.stopPropagation()}><button className="stitch-modal-close" onClick={()=>setProjectOpen(false)}><X/></button><FolderOpen size={25}/><h2>Choose a project</h2><p>Keep your research, sources and reports organised.</p><input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Enter project name"/><button className="stitch-modal-primary" onClick={()=>setProjectOpen(false)}>Save project</button></div></div>}
  </div>;
}
