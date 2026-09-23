import { ArrowDownRight, ArrowUpRight, ChevronRight, Instagram, Menu, Play, Shield, X, Youtube } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const logo = "/manus-storage/cobra-logo_d1e71238.png";

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Academy", "/academy"],
    ["Training", "/training"],
    ["Achievements", "/achievements"],
    ["Gallery", "/gallery"],
    ["Attendance", "/attendance"],
  ];
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" onClick={() => setOpen(false)}>
        <img src={logo} alt="The Cobra Karate Academy crest" />
        <span><small>THE</small> COBRA</span>
      </Link>
      <nav className={`main-nav ${open ? "is-open" : ""}`}>
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/contact" className="nav-cta" onClick={() => setOpen(false)}>Start here <ArrowUpRight size={14} /></Link>
      </nav>
      <button className="menu-toggle" onClick={() => setOpen(value => !value)} aria-label="Toggle menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label"><span />{children}</div>;
}

export default function Home() {
  const { data: content } = trpc.content.get.useQuery();
  const training = content?.training ?? [];
  const achievements = content?.achievements ?? [];
  const gallery = content?.gallery ?? [];
  const announcements = content?.announcements ?? [];

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(5,5,5,.98) 0%, rgba(5,5,5,.78) 47%, rgba(5,5,5,.30) 100%), linear-gradient(0deg, rgba(5,5,5,.95), transparent 55%), url('/manus-storage/japanese-karate_a4a28657.webp')" }}>
          <div className="hero-grid" />
          <div className="hero-kanji" aria-hidden="true"><span>空</span><span>手</span></div>
          <div className="hero-copy page-width">
            <div className="hero-kicker"><span className="pulse-dot" /> {content?.eyebrow ?? "THE COBRA STANDARD"}</div>
            <h1>{content?.headline ?? "DISCIPLINE. POWER. PRECISION."}</h1>
            <p>{content?.intro ?? "A modern martial arts academy built around quiet confidence, technical excellence, and the work no one sees."}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#training">Join the academy <ArrowUpRight size={16} /></a>
              <Link className="button button-ghost" href="/training">Explore training <ChevronRight size={16} /></Link>
            </div>
            <div className="hero-note"><Shield size={16} /> Build the body. Sharpen the mind. Keep showing up.</div>
          </div>
          <div className="hero-mark"><img src={logo} alt="The Cobra Karate Academy logo" /></div>
          <div className="scroll-cue"><ArrowDownRight size={18} /> Scroll to enter</div>
        </section>

        <section className="section page-width split-section" id="academy">
          <div className="section-intro">
            <SectionLabel>01 — The academy</SectionLabel>
            <h2>Quiet confidence.<br /><em>Visible results.</em></h2>
            <Link className="text-link" href="/academy">Meet the academy <ArrowUpRight size={15} /></Link>
          </div>
          <div className="section-body">
            <p className="lead">{content?.story ?? "Your academy story belongs here. Add the origin, philosophy, and community you want future students to understand."}</p>
            <p>{content?.mission ?? "Build disciplined people through a practice that rewards patience, presence, and precision."}</p>
            <div className="principles"><span>01 / Presence</span><span>02 / Precision</span><span>03 / Progress</span></div>
          </div>
        </section>

        <section className="section dark-section" id="training">
          <div className="page-width">
            <div className="section-heading-row"><div><SectionLabel>02 — The practice</SectionLabel><h2>Training, without<br /><em>the noise.</em></h2></div><Link className="text-link" href="/training">View all disciplines <ArrowUpRight size={15} /></Link></div>
            <div className="training-grid">
              {training.map((item: { title: string; description: string }, index: number) => <Link href="/training" className={`training-card card-${index + 1}`} key={item.title}><span className="card-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p><span className="card-arrow"><ArrowUpRight size={17} /></span></Link>)}
            </div>
          </div>
        </section>

        <section className="section page-width feature-section">
          <div className="feature-image"><img src="/manus-storage/kick-motion_d21625b0.jpg" alt="Martial artist in a powerful kick" /><div className="image-caption">01 / Power in motion</div></div>
          <div className="feature-copy"><SectionLabel>03 — The standard</SectionLabel><h2>Every rep is a<br /><em>vote for who you become.</em></h2><p>There is no shortcut around the mat. Only a clear next step, a patient teacher, and the decision to return tomorrow.</p><Link className="button button-dark" href="/contact">Find your starting point <ArrowUpRight size={16} /></Link></div>
        </section>

        <section className="section dark-section achievements-section">
          <div className="page-width"><div className="section-heading-row"><div><SectionLabel>04 — The record</SectionLabel><h2>Work worth<br /><em>remembering.</em></h2></div><Link className="text-link" href="/achievements">See achievements <ArrowUpRight size={15} /></Link></div><div className="achievement-list">{achievements.map((item: { year: string; title: string; description: string }) => <Link href="/achievements" className="achievement-row" key={item.title}><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowUpRight size={20} /></Link>)}</div></div>
        </section>

        <section className="section page-width gallery-section"><div className="section-heading-row"><div><SectionLabel>05 — In the room</SectionLabel><h2>See the practice<br /><em>in motion.</em></h2></div><Link className="text-link" href="/gallery">Open gallery <ArrowUpRight size={15} /></Link></div><div className="gallery-grid">{gallery.slice(0, 4).map((item: { src: string; alt: string; label: string }, index: number) => <Link href="/gallery" className={`gallery-tile tile-${index + 1}`} key={item.src}><img src={item.src} alt={item.alt} /><span>{item.label}</span>{index === 0 && <span className="play-icon"><Play size={15} fill="currentColor" /></span>}</Link>)}</div></section>

        {content?.sessionVideo?.src && <section className="section session-video-section"><div className="page-width session-video-grid"><div><SectionLabel>06 — Today's session</SectionLabel><h2>{content.sessionVideo.title ?? "Inside the dojo."}</h2><p>{content.sessionVideo.description ?? "A closer look at the work behind the standard."}</p></div><div className="session-video-frame"><video controls preload="metadata" poster={gallery[0]?.src}><source src={content.sessionVideo.src} /></video><span className="session-video-caption">Tap to play / 今日の稽古</span></div></div></section>}
        <section className="announcement-band"><div className="page-width announcement-inner"><SectionLabel>Latest from the dojo</SectionLabel><div className="announcement-items">{announcements.map((item: { date: string; title: string; description: string }) => <div className="announcement" key={item.title}><span>{item.date}</span><strong>{item.title}</strong><p>{item.description}</p></div>)}</div></div></section>
      </main>
      <Footer content={content} />
    </div>
  );
}

export function Footer({ content }: { content?: any }) {
  return <footer className="site-footer"><div className="page-width footer-grid"><div><Link href="/" className="footer-brand"><img src={logo} alt="Cobra crest" /><span>THE COBRA<br /><small>KARATE ACADEMY</small></span></Link><p>{content?.footer ?? "Training is the promise you keep to yourself."}</p></div><div className="footer-links"><div><span className="footer-heading">Explore</span><Link href="/academy">Academy</Link><Link href="/training">Training</Link><Link href="/gallery">Gallery</Link></div><div><span className="footer-heading">Connect</span><Link href="/contact">Contact</Link><a href={content?.social?.instagram ?? "#"}><Instagram size={15} /> Instagram</a><a href={content?.social?.youtube ?? "#"}><Youtube size={15} /> YouTube</a></div></div></div><div className="page-width footer-bottom"><span>© 2026 The Cobra Karate Academy</span><Link href="/attendance" className="attendance-footer-link">Check attendance</Link><Link href="/coach-login" className="coach-login">Coach login</Link><span>Built for the work.</span></div></footer>;
}
