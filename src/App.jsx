import { useEffect, useState } from 'react';
import Workspace from './Workspace';
import { ArrowUpRight, ArrowRight, Menu, X, Plus, Minus, Sparkles, Search, FileText, ShieldCheck, Network, BrainCircuit, BookOpen, Check, ChevronDown } from 'lucide-react';

const photo = (id, w=1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=88`;
const projects = [
  {name:'Evidence, at a glance',type:'RESEARCH INTELLIGENCE',desc:'A clear view of what the latest research says — and what it leaves unanswered.',image:'https://images.unsplash.com/photo-1606837731771-4b732ecc477f?auto=format&fit=crop&w=1400&q=88',alt:'Documentary street photography from Jaipur, Rajasthan'},
  {name:'A better way to read',type:'PAPER ANALYSIS',desc:'Turn dense papers into useful findings, methods and limitations.',image:'https://www.culibrary.ac.in/culib/images/portfolio/p4-L.jpg',alt:'Students reading and studying in an Indian university library'},
  {name:'Beyond the first result',type:'ACADEMIC DISCOVERY',desc:'Follow sources across disciplines and uncover the connections between them.',image:'https://srinivasuniversity.edu.in/images/research-bg.jpg',alt:'Researchers working in a university laboratory in India'},
  {name:'The complete picture',type:'SYNTHESIS & REPORTS',desc:'Bring evidence together in structured reports with traceable citations.',image:'https://staybanaras.co.in/images/static/ghat.jpg',alt:'Documentary photograph of Varanasi ghats at sunrise'},
];
const services = [
  ['01','Research discovery','Search the open web and academic literature to find credible, relevant sources.','orange'],
  ['02','Paper & PDF intelligence','Extract methodology, results, limitations and evidence from complex documents.','green'],
  ['03','Evidence verification','Cross-check claims, compare findings and surface contradictions.','orange'],
  ['04','Research synthesis','Connect ideas across sources and turn fragmented information into insight.','yellow'],
  ['05','Cited report generation','Create clear, structured reports with references you can inspect.','green'],
];
const benefits = [
  ['Stand on evidence','Every important finding connects back to a source you can inspect.','orange'],
  ['More than one perspective','Multiple specialist agents approach the question from different angles.','green'],
  ['No black boxes','See what was searched, what was found and how conclusions were formed.','yellow'],
  ['Less time searching','Automate repetitive discovery and document-reading work.','green'],
  ['Contradictions included','Disagreement between sources is surfaced, not quietly ignored.','yellow'],
  ['You stay in control','Guide the question, review the evidence and own the final judgement.','orange'],
];
const steps = [
  ['01','Define the question','Share your research goal, context and scope. ResearchX turns it into a focused research plan.','✳'],
  ['02','Discover & analyse','Research agents find sources while the analyst extracts the most relevant evidence.','✦'],
  ['03','Verify the evidence','The fact-checker compares claims, checks source support and flags contradictions.','⌘'],
  ['04','Build your report','The report writer brings everything together with citations and clear limitations.','✣'],
];
const faqs = [
  ['What is ResearchX?','ResearchX is an autonomous research workspace that coordinates specialist AI agents to discover sources, analyse evidence, check claims and produce structured reports.'],
  ['How is it different from a chatbot?','Instead of returning one response, ResearchX is designed to carry out a multi-step research workflow: searching, reading, comparing, verifying and reporting.'],
  ['Can I verify the sources?','Yes. Source traceability is central to the product. Findings are designed to link back to their supporting articles, papers or documents.'],
  ['Can ResearchX analyse PDFs?','The platform is designed to accept research documents and extract relevant methods, findings and limitations.'],
  ['Does it replace human researchers?','No. It accelerates discovery and synthesis while keeping people in control of scope, interpretation and final decisions.'],
];

function Landing({onLaunch}) {
  const [menu,setMenu]=useState(false),[faq,setFaq]=useState(-1),[email,setEmail]=useState(''),[sent,setSent]=useState(false),[scrollProgress,setScrollProgress]=useState(0),[activeSection,setActiveSection]=useState('about');
  useEffect(()=>{
    const nodes=[...document.querySelectorAll('.rx-reveal, .rx-reveal-child')];
    const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:0.12,rootMargin:'0px 0px -7% 0px'});
    nodes.forEach((node,index)=>{node.style.setProperty('--reveal-delay',`${Math.min(index%5,4)*90}ms`);observer.observe(node);});
    const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setScrollProgress(max>0?window.scrollY/max*100:0);};
    const sections=[...document.querySelectorAll('main section[id]')];
    const spy=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActiveSection(entry.target.id);}),{rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(section=>spy.observe(section));
    const pointer=(event)=>{document.documentElement.style.setProperty('--pointer-x',`${event.clientX}px`);document.documentElement.style.setProperty('--pointer-y',`${event.clientY}px`);};
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);window.addEventListener('pointermove',pointer,{passive:true});
    return()=>{observer.disconnect();spy.disconnect();window.removeEventListener('scroll',update);window.removeEventListener('resize',update);window.removeEventListener('pointermove',pointer);};
  },[]);
  const nav=[['Portfolio','#portfolio'],['Service','#service'],['About Us','#about'],['Pages','#pages']];
  const go=(id)=>{setMenu(false);document.querySelector(id)?.scrollIntoView({behavior:'smooth'});};
  return <div className="rx-site" id="top">
    <div className="rx-scroll-progress" style={{transform:`scaleX(${scrollProgress/100})`}}/><div className="rx-pointer-glow" aria-hidden="true"/>
    <header className="rx-nav"><a className="rx-logo" href="#top">rese<span>arch</span><b>x</b></a><nav className={menu?'rx-nav-links open':'rx-nav-links'}>{nav.map(([label,href])=><a className={activeSection===href.slice(1)?'active':''} key={label} href={href} onClick={()=>setMenu(false)}>{label}{label==='Pages'&&<ChevronDown size={15}/>}</a>)}</nav><button className="rx-nav-cta" onClick={()=>go('#contact')}>Get In Touch <ArrowUpRight size={16}/></button><button className="rx-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></header>
    <main>
      <section className="rx-hero" id="about"><div className="rx-glow rx-glow-left"/><div className="rx-glow rx-glow-right"/><div className="rx-hero-shapes" aria-hidden="true"><i/><i/><i/><i/><i/></div><div className="rx-hero-content"><span className="rx-pill">AUTONOMOUS RESEARCH PLATFORM</span><h1>We Transform <em>Questions</em><br/><i>into research intelligence</i></h1><p>Research that goes beyond the first answer. Discover sources, connect evidence and turn complex questions into clear, cited insights.</p><div className="rx-hero-actions"><button className="rx-btn rx-btn-light" onClick={onLaunch}>Start Research <ArrowUpRight size={17}/></button><button className="rx-btn rx-btn-dark" onClick={()=>go('#portfolio')}>Explore Research <ArrowRight size={17}/></button></div></div><div className="rx-hero-foot"><span>DISCOVER · ANALYSE · VERIFY · SYNTHESISE</span><span>SCROLL TO EXPLORE ↓</span></div></section>

      <section className="rx-portfolio rx-section rx-reveal" id="portfolio"><div className="rx-section-top"><span className="rx-pill">FEATURED WORK</span><p>ResearchX capabilities</p></div><h2 className="rx-center-heading"><span>Dive into a more</span> intelligent way<br/>of <em>understanding</em> research</h2><div className="rx-project-grid">{projects.map((p,i)=><article className="rx-project rx-reveal-child" key={p.name}><div className="rx-project-frame"><img src={p.image} alt={p.alt} loading="lazy"/><span className="rx-project-count">0{i+1} / 04</span><button onClick={onLaunch} aria-label={`Explore ${p.name}`}><ArrowUpRight/></button></div><div className="rx-project-caption"><div><h3>{p.name}</h3><p>{p.desc}</p></div><span>{p.type}</span></div></article>)}</div></section>

      <section className="rx-india-strip rx-section rx-reveal" aria-label="Research in the real world">
        <div className="rx-india-copy"><span className="rx-pill">ROOTED IN THE REAL WORLD</span><h2>Research has a <em>place.</em><br/>And people behind it.</h2><p>From university libraries and working labs to the streets and cities where ideas take shape — ResearchX is built around real sources, real contexts and real evidence.</p></div>
        <div className="rx-india-images">
          <figure className="rx-india-photo tall"><img src="https://images.unsplash.com/photo-1786243586263-2ae75da3d82e?auto=format&fit=crop&w=1100&q=85" alt="Photographic night view of Patrika Gate in Jaipur" loading="lazy"/><figcaption>Jaipur · Architecture & culture</figcaption></figure>
          <figure className="rx-india-photo short"><img src="https://www.vidya.edu.in/images/library/3.jpg" alt="Students studying in an Indian university library" loading="lazy"/><figcaption>Learning · Shared knowledge</figcaption></figure>
          <figure className="rx-india-photo wide"><img src="https://cdn.wionews.com/sites/default/files/2022/03/19/248705-researchers-at-sudha-gopalakrishnan-brain-centre-which-was-inaugurated-at-iit-madras-on-19th-march-2022.JPG" alt="Researchers working in a laboratory at IIT Madras" loading="lazy"/><figcaption>Chennai · Research in action</figcaption></figure>
        </div>
      </section>

      <section className="rx-services rx-section rx-reveal" id="service"><div className="rx-section-top"><span className="rx-pill">WHAT WE DO</span><p>One connected research workflow</p></div><h2 className="rx-left-heading">From the first question<br/>to a <em>defensible answer.</em></h2><div className="rx-service-list">{services.map(([n,title,desc,color])=><article className={`rx-service-row ${color} rx-reveal-child`} key={n}><span className="rx-service-number">{n}</span><h3>{title}</h3><p>{desc}</p><ArrowUpRight className="rx-service-arrow"/></article>)}</div></section>

      <section className="rx-process rx-section rx-reveal" id="pages"><div className="rx-section-top"><span className="rx-pill">HOW WE WORK</span><p>From curiosity to clarity</p></div><h2 className="rx-center-heading">How we turn<br/><em>questions into answers</em></h2><div className="rx-orbit-shape" aria-hidden="true"><i/><i/><i/></div><div className="rx-step-list">{steps.map(([n,title,desc,symbol],i)=><article className="rx-step-card rx-reveal-child" key={n}><div className={`rx-step-symbol s${i}`}>{symbol}</div><div><span>STEP {n}</span><h3>{title}</h3><p>{desc}</p></div><b>{n}</b></article>)}</div></section>

      <section className="rx-benefits rx-section rx-reveal"><div className="rx-section-top"><span className="rx-pill">WHY RESEARCHX</span><p>Built for curious minds</p></div><h2 className="rx-left-heading">Small teams. Big questions —<br/><em>better answers.</em></h2><div className="rx-benefit-grid">{benefits.map(([title,desc,color],i)=><article className="rx-benefit rx-reveal-child" key={title}><div className={`rx-benefit-icon ${color}`}>{['↗','◒','✳','⌁','✣','✦'][i]}</div><h3>{title}</h3><p>{desc}</p></article>)}</div></section>

      <section className="rx-agents rx-section rx-reveal"><div className="rx-section-top"><span className="rx-pill">THE AGENT NETWORK</span><p>Specialists working together</p></div><h2 className="rx-center-heading">Not one AI.<br/><em>A team of agents.</em></h2><div className="rx-agent-grid"><article className="rx-reveal-child"><Search/><span>01 / DISCOVER</span><h3>Researcher</h3><p>Finds relevant papers, reports and primary sources across multiple channels.</p></article><article className="rx-reveal-child"><BrainCircuit/><span>02 / INTERPRET</span><h3>Analyst</h3><p>Reads the material and extracts claims, methods, findings and limitations.</p></article><article className="rx-reveal-child"><ShieldCheck/><span>03 / VERIFY</span><h3>Fact-checker</h3><p>Cross-checks claims, identifies contradictions and evaluates source support.</p></article><article className="rx-reveal-child"><FileText/><span>04 / DELIVER</span><h3>Report writer</h3><p>Creates a structured report with clear reasoning and traceable citations.</p></article></div></section>

      <section className="rx-testimonial rx-section rx-reveal"><span className="rx-pill">THE RESEARCHX PROMISE</span><h2>“A better answer<br/>starts with <em>better questions.</em>”</h2><p>Every source matters. Every contradiction deserves attention. Every conclusion should be traceable.</p><span className="rx-testimonial-mark">RESEARCHX / PRINCIPLE 001</span></section>

      <section className="rx-faq rx-section rx-reveal"><div className="rx-faq-heading"><span className="rx-pill">FAQs</span><h2>Questions &<br/><em>answers.</em></h2><p>Curious about how ResearchX works? Here's what you should know.</p></div><div className="rx-faq-list">{faqs.map(([q,a],i)=><article className={`rx-faq-item ${faq===i?'active':''}`} key={q}><button onClick={()=>setFaq(faq===i?-1:i)}>{q}{faq===i?<Minus/>:<Plus/>}</button>{faq===i&&<p>{a}</p>}</article>)}</div></section>

      <section className="rx-contact rx-section rx-reveal" id="contact"><div className="rx-contact-grid"/><div className="rx-contact-shapes" aria-hidden="true"><i/><i/><i/><i/></div><span className="rx-pill">LET'S BUILD SOMETHING MEANINGFUL</span><button className="rx-big-cta" onClick={onLaunch}><span className="rx-cta-icon"><ArrowRight/></span>Let's Get Started <ArrowUpRight className="rx-cta-arrow"/></button><p>Have a question worth exploring? Your next research journey starts here.</p></section>
    </main>
    <footer className="rx-footer"><a className="rx-logo" href="#top">rese<span>arch</span><b>x</b></a><p>From curiosity to clarity.<br/>Research, with a little more intelligence.</p><div className="rx-footer-links"><a href="#portfolio">Portfolio</a><a href="#service">Services</a><a href="#pages">How it works</a><a href="#contact">Get in touch</a><button onClick={onLaunch}>Open workspace <ArrowUpRight size={14}/></button></div><div className="rx-footer-bottom"><span>© 2026 RESEARCHX. ALL RIGHTS RESERVED.</span><span>BUILT TO FOLLOW THE EVIDENCE.</span><a href="#top">BACK TO TOP ↑</a></div></footer>
  </div>;
}

function WelcomeNameModal({ onContinue, onClose }) {
  const [name, setName] = useState('');
  return <div className="rx-name-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="rx-name-modal" onSubmit={e => { e.preventDefault(); if (name.trim()) onContinue(name.trim()); }}>
      <span className="rx-pill">WELCOME TO RESEARCHX</span>
      <h2>Before we begin,<br/><em>what should we call you?</em></h2>
      <p>Your name will be used to personalise this workspace on this device.</p>
      <label htmlFor="rx-user-name">Your name</label>
      <input id="rx-user-name" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" maxLength={40}/>
      <button type="submit" disabled={!name.trim()}>Continue to ResearchX <ArrowUpRight size={16}/></button>
      <button type="button" className="rx-name-cancel" onClick={onClose}>Back to landing page</button>
    </form>
  </div>;
}

export default function App(){
  const [workspace,setWorkspace]=useState(false);
  const [showName,setShowName]=useState(false);
  const [userName,setUserName]=useState(() => { try { return localStorage.getItem('researchx-user-name') || ''; } catch { return ''; } });
  const launch=()=>{ if(userName){setWorkspace(true);window.scrollTo({top:0,behavior:'instant'});} else setShowName(true); };
  const continueWithName=(name)=>{setUserName(name);try{localStorage.setItem('researchx-user-name',name);}catch{}setShowName(false);setWorkspace(true);window.scrollTo({top:0,behavior:'instant'});};
  return <>{workspace?<Workspace userName={userName}/>:<Landing onLaunch={launch}/ >}{showName&&<WelcomeNameModal onContinue={continueWithName} onClose={()=>setShowName(false)}/>}</>;
}
