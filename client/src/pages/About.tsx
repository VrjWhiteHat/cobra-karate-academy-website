import { ArrowUpRight, Check, Shield } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Footer } from "./Home";

const logo = "/manus-storage/cobra-official-logo_6a121ed2.png";

export default function About() {
  const { data: content } = trpc.content.get.useQuery();
  return <div className="site-shell"><Header /><main>
    <section className="page-hero page-width about-hero"><div className="page-hero-meta"><span>01</span><span>About us</span></div><h1>Built by the<br /><em>work.</em></h1><p>{content?.intro ?? "The Cobra Karate Academy is a place where discipline becomes confidence and every student gets a clear next step."}</p></section>
    <section className="section page-width about-intro"><div className="about-visual"><img src={content?.coachPhoto ?? "/manus-storage/dojo-space_e988f290.jpg"} alt={content?.coachName ? `${content.coachName}, Cobra Karate Academy coach` : "Cobra Karate Academy coach"} /><span>THE COACH / THE STANDARD / THE ROOM</span></div><div className="about-copy"><div className="section-label"><span />Our story</div><h2>A dojo for<br /><em>becoming.</em></h2><p className="lead">{content?.story ?? "Your academy story belongs here. Add the origin, philosophy, and community you want future students to understand."}</p><p>{content?.mission ?? "Build disciplined people through a practice that rewards patience, presence, and precision."}</p><Link className="button button-primary" href="/contact">Start a conversation <ArrowUpRight size={16} /></Link></div></section>
    <section className="section dark-section about-coach"><div className="page-width about-coach-grid"><div><div className="section-label"><span />Meet the coach</div><h2>{content?.coachName ?? "The coach"}<br /><em>behind the standard.</em></h2><p className="lead">{content?.coachBio ?? "A coach profile will appear here once it is added from the Coach Portal."}</p><div className="coach-values"><span><Shield size={16} /> Technical detail</span><span><Check size={16} /> Patient guidance</span><span><Check size={16} /> Strong foundations</span></div></div><div className="about-coach-card"><img src={content?.coachPhoto ?? logo} alt="Coach profile" /><div><span>THE COBRA / COACH PROFILE</span><strong>{content?.coachName ?? "Coach profile pending"}</strong></div></div></div></section>
    <section className="section page-width about-values"><div className="section-label"><span />What we believe</div><h2>Quiet work.<br /><em>Real change.</em></h2><div className="about-value-grid"><div><b>01</b><h3>Discipline</h3><p>Show up consistently, especially when no one is watching.</p></div><div><b>02</b><h3>Precision</h3><p>Respect the small details that make strong technique.</p></div><div><b>03</b><h3>Community</h3><p>Grow in a room where every student is taken seriously.</p></div></div></section>
  </main><Footer content={content} /></div>;
}

function Header() { return <header className="site-header page-width"><Link href="/" className="brand-lockup"><img src={logo} alt="Cobra crest" /><span><small>THE</small> COBRA</span></Link><nav className="desktop-page-nav"><Link href="/about">About us</Link><Link href="/academy">Academy</Link><Link href="/training">Training</Link><Link href="/gallery">Gallery</Link><Link href="/attendance">Attendance</Link><Link className="nav-cta" href="/contact">Start here <ArrowUpRight size={14} /></Link></nav></header>; }
