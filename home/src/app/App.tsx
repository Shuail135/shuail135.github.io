import {useState, useEffect, useRef} from "react";
import {
    Github,
    Linkedin,
    Mail,
    Download,
    Folder,
    Menu,
    X,
    ExternalLink,
    Music,
    Headphones,
    Send,
    ChevronRight,
    Volume2,
} from "lucide-react";
import resumePdf from "../../pdf/Résumé.pdf";
import {NAV_ITEMS, PROJECTS, SKILL_CATEGORIES, SKILL_LABELS, SKILLS} from "./data";
import {CONTENT} from "./content";
import type {Section, ThemeMode} from "./types";
import {Avatar, idleDuck} from "./components/Avatar";
import {ThemeToggle} from "./components/ThemeToggle";
import {WaveformViz} from "./components/WaveformViz";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
    const [activeSection, setActiveSection] = useState<Section>("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState<ThemeMode>(() => {
        if (typeof window === "undefined") return "dark";
        return (window.localStorage.getItem("theme") as ThemeMode | null) ?? "dark";
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [formSent, setFormSent] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const avatarTriggerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.classList.toggle("light", theme === "light");
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

    const scrollTo = (id: Section) => {
        document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
        setActiveSection(id);
        setMenuOpen(false);
    };

    useEffect(() => {
        const sections: Section[] = [
            "home",
            "about",
            "skills",
            "projects",
            "music",
            "contact",
        ];
        const observers: IntersectionObserver[] = [];

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(id);
                },
                {threshold: 0.3}
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!WEB3FORMS_ACCESS_KEY) {
            setFormError(CONTENT.contact.form.errors.missingAccessKey);
            return;
        }

        setFormSubmitting(true);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    from_name: "Portfolio Contact Form",
                    subject: `New portfolio message from ${formData.name}`,
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || CONTENT.contact.form.errors.fallback);
            }

            setFormSent(true);
            setFormData({name: "", email: "", message: ""});
        } catch (error) {
            setFormError(error instanceof Error ? error.message : CONTENT.contact.form.errors.fallback);
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className={`relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans ${theme}`}>
            <div className="space-backdrop fixed inset-0 pointer-events-none"/>
            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-6">
                    <button
                        onClick={() => scrollTo("home")}
                        className="font-display font-bold text-lg tracking-tight text-foreground flex flex-shrink-0 items-center gap-2"
                    >
                        <img
                            src={idleDuck}
                            alt=""
                            aria-hidden="true"
                            draggable="false"
                            className="h-8 w-8 object-contain"
                            style={{imageRendering: "pixelated"}}
                        />
                        <span><span className="text-primary">{CONTENT.site.brandPrefix}</span>{CONTENT.site.owner}<span className="text-primary">{CONTENT.site.brandSuffix}</span></span>
                    </button>

                    {/* Desktop nav */}
                    <div className="hidden lg:flex items-center gap-1 ml-auto">
                        {NAV_ITEMS.map(({id, label}) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                    activeSection === id
                                        ? "bg-primary/15 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:border-l lg:border-border lg:pl-3">
                        <ThemeToggle theme={theme} onToggle={toggleTheme}/>
                        <button
                            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                        >
                            {menuOpen ? <X size={20}/> : <Menu size={20}/>} 
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-border bg-background/96 backdrop-blur-xl">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
                            {NAV_ITEMS.map(({id, label}) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id)}
                                    className={`px-4 py-2.5 rounded-lg text-sm text-left transition-all ${
                                        activeSection === id
                                            ? "bg-primary/15 text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <main className="relative z-10 pt-16">
                {/* ── HERO ── */}
                <section
                    id="home"
                    className="relative min-h-screen flex items-center overflow-hidden"
                >
                    {/* Ambient glows */}
                    <div className="absolute inset-0 pointer-events-none select-none">
                        <div
                            className="absolute -top-28 left-1/4 w-[560px] h-[560px] rounded-full bg-violet-600/16 blur-3xl"/>
                        <div
                            className="absolute top-1/3 right-1/6 w-[420px] h-[420px] rounded-full bg-cyan-400/10 blur-3xl"/>
                        <div
                            className="absolute bottom-10 left-1/3 w-[360px] h-[360px] rounded-full bg-fuchsia-500/10 blur-3xl"/>
                        <div className="pixel-stars absolute inset-0 opacity-70"/>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center w-full">
                        {/* Text side */}
                        <div className="order-2 lg:order-1">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                                {CONTENT.hero.status}
                            </div>

                            <h1 className="text-5xl lg:text-[4.5rem] font-display font-extrabold leading-[1.06] tracking-tight mb-6">
                                {CONTENT.hero.greetingPrefix}{" "}
                                <span
                                    className="inline-block bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: "var(--name-gradient)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >{CONTENT.site.owner}</span>
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[480px]">
                                {CONTENT.hero.description}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={CONTENT.hero.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Github size={15}/> {CONTENT.hero.actions.github}
                                </a>
                                <a
                                    href={CONTENT.hero.links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Linkedin size={15}/> {CONTENT.hero.actions.linkedin}
                                </a>
                                <a
                                    href={resumePdf}
                                    download="Sum-Yan-Wan-Resume.pdf"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Download size={15}/> {CONTENT.hero.actions.resume}
                                </a>
                                <button
                                    onClick={() => scrollTo("projects")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Folder size={15}/> {CONTENT.hero.actions.projects}
                                </button>
                                <button
                                    onClick={() => scrollTo("contact")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200"
                                >
                                    <Mail size={15}/> {CONTENT.hero.actions.contact}
                                </button>
                            </div>
                        </div>

                        {/* Avatar side */}
                        <div className="order-1 lg:order-2 flex justify-center">
                            <div className="relative isolate w-64 h-64 [--avatar-size:16rem] lg:w-[380px] lg:h-[380px] lg:[--avatar-size:380px]">
                                {/* Slow orbit rings */}
                                <div
                                    className="pointer-events-none absolute -inset-[2%] z-0 rounded-full border avatar-orbit-ring-outer"
                                    style={{
                                        animation: "spin 22s linear infinite",
                                    }}
                                >
                                    <div
                                        className="pixel-creature pixel-creature-accent absolute top-0 left-1/2 z-[60] -translate-x-1/2 -translate-y-1/2"/>
                                </div>
                                <div
                                    className="pointer-events-none absolute inset-[6.5%] z-0 rounded-full border avatar-orbit-ring-inner"
                                    style={{
                                        animation: "spin 16s linear infinite reverse",
                                    }}
                                />
                                {/* Avatar container */}
                                <div
                                    className="absolute inset-[15.625%] z-20 rounded-full overflow-hidden border border-primary/25 shadow-2xl shadow-primary/15 bg-card">
                                    <div
                                        className="absolute inset-x-0 bottom-[-10px] h-[55%] overflow-hidden bg-sky-500/80"
                                        style={{
                                            clipPath:
                                                "polygon(0 22px, 4% 22px, 4% 18px, 8% 18px, 8% 14px, 12% 14px, 12% 10px, 18% 10px, 18% 6px, 24% 6px, 24% 10px, 30% 10px, 30% 14px, 36% 14px, 36% 18px, 42% 18px, 42% 14px, 48% 14px, 48% 10px, 54% 10px, 54% 6px, 60% 6px, 60% 4px, 66% 4px, 66% 8px, 72% 8px, 72% 12px, 78% 12px, 78% 16px, 84% 16px, 84% 20px, 90% 20px, 90% 16px, 96% 16px, 96% 20px, 100% 20px, 100% 100%, 0 100%)",
                                        }}
                                    >
                                        <div
                                            className="water-drift-slow absolute inset-0 opacity-95"
                                            style={{
                                                imageRendering: "pixelated",
                                                backgroundImage:
                                                    "linear-gradient(180deg, rgba(96,165,250,0.94) 0 8px, rgba(14,165,233,0.95) 8px 18px, rgba(2,132,199,0.94) 18px 30px, rgba(56,189,248,0.9) 30px 42px), linear-gradient(90deg, rgba(186,230,253,0.14) 0 6px, transparent 6px 22px, rgba(7,89,133,0.18) 22px 30px, transparent 30px 42px)",
                                                backgroundSize: "100% 42px, 42px 100%",
                                            }}
                                        />
                                        <div
                                            className="water-drift-medium absolute inset-0 opacity-75"
                                            style={{
                                                imageRendering: "pixelated",
                                                backgroundImage:
                                                    "linear-gradient(90deg, transparent 0 8px, rgba(191,219,254,0.3) 8px 14px, transparent 14px 28px, rgba(12,74,110,0.22) 28px 36px, transparent 36px 48px), linear-gradient(180deg, transparent 0 6px, rgba(125,211,252,0.13) 6px 12px, transparent 12px 24px, rgba(3,105,161,0.18) 24px 32px, transparent 32px 42px)",
                                                backgroundSize: "48px 38px, 54px 42px",
                                            }}
                                        />
                                        <div
                                            className="water-drift-fast absolute inset-0 opacity-60"
                                            style={{
                                                imageRendering: "pixelated",
                                                backgroundImage:
                                                    "linear-gradient(90deg, transparent 0 10px, rgba(186,230,253,0.36) 10px 16px, transparent 16px 32px, rgba(147,197,253,0.3) 32px 38px, transparent 38px 56px), linear-gradient(180deg, transparent 0 14px, rgba(2,132,199,0.2) 14px 20px, transparent 20px 34px, rgba(224,242,254,0.24) 34px 40px, transparent 40px 56px)",
                                                backgroundSize: "56px 44px, 62px 56px",
                                            }}
                                        />
                                        <div
                                            className="water-drift-speckles absolute inset-0 opacity-65"
                                            style={{
                                                imageRendering: "pixelated",
                                                backgroundImage:
                                                    "radial-gradient(circle at 12px 12px, rgba(224,242,254,0.34) 0 3px, transparent 4px), radial-gradient(circle at 34px 28px, rgba(7,89,133,0.22) 0 4px, transparent 5px), radial-gradient(circle at 50px 18px, rgba(125,211,252,0.24) 0 3px, transparent 4px)",
                                                backgroundSize: "64px 48px",
                                            }}
                                        />
                                    </div>
                                    <div className="relative z-10 w-full h-full">
                                        <Avatar triggerRef={avatarTriggerRef}/>
                                    </div>
                                </div>
                                <div
                                    className="avatar-theme-overlay"
                                    onClick={() => avatarTriggerRef.current?.()}
                                    aria-hidden="true"
                                >
                                    <div className="avatar-theme-overlay-image"/>
                                </div>
                                <div
                                    className="top-creature-layer pointer-events-none absolute inset-[6.5%] z-[80] rounded-full"
                                    style={{
                                        animation: "spin 16s linear infinite reverse",
                                    }}
                                >
                                    <div
                                        className="pixel-creature pixel-creature-primary absolute bottom-0 left-1/2 z-[90] -translate-x-1/2 translate-y-1/2"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll hint */}
                    <div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 text-xs pointer-events-none">
            <span className="font-mono tracking-widest uppercase text-[10px]">
              {CONTENT.hero.scrollHint}
            </span>
                        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent"/>
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section id="about" className="py-32 border-t border-border">
                    <div className="max-w-3xl mx-auto px-6">
                        {/* Bio text */}
                        <div>
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                {CONTENT.about.eyebrow}
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-8 leading-[1.1]">
                                {CONTENT.about.heading.first}{" "}
                                <span className="text-primary">{CONTENT.about.heading.primary}</span>{" "}
                                <span className="text-muted-foreground font-normal">{CONTENT.about.heading.muted}</span>{" "}
                                <span className="text-accent">{CONTENT.about.heading.accent}</span>
                            </h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    {CONTENT.about.paragraphs[0]}
                                </p>
                                <p>
                                    {CONTENT.about.paragraphs[1]}
                                </p>
                                <p>
                                    {CONTENT.about.paragraphs[2]}
                                </p>
                                <p>
                                    {CONTENT.about.paragraphs[3]}
                                </p>
                            </div>
                            <button
                                onClick={() => scrollTo("contact")}
                                className="mt-8 inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary/75 transition-colors group"
                            >
                                {CONTENT.about.cta}
                                <ChevronRight
                                    size={15}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── SKILLS ── */}
                <section id="skills" className="py-32 border-t border-border">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                {CONTENT.skills.eyebrow}
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold">
                                {CONTENT.skills.heading}
                            </h2>
                        </div>

                        {SKILL_CATEGORIES.map((category) => {
                            const items = SKILLS.filter((s) => s.category === category);
                            return (
                                <div key={category} className="mb-10 last:mb-0">
                                    <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-[0.14em] mb-4">
                                        {SKILL_LABELS[category]}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {items.map(({name, color, logo, invertLogo, logoBg}) => (
                                            <div
                                                key={name}
                                                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-default ${
                                                    ["Python", "C++", "Java", "SQL"].includes(name)
                                                        ? "bg-primary/12 border-primary/55 shadow-[0_0_18px_rgba(124,58,237,0.18)] hover:bg-primary/18 hover:border-primary/75"
                                                        : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
                                                }`}
                                            >
                                                {logo ? (
                                                    <>
                            <span
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                                style={logoBg ? {backgroundColor: logoBg} : undefined}
                            >
                              <img
                                  src={logo}
                                  alt=""
                                  aria-hidden="true"
                                  className="h-5 w-5 object-contain"
                                  draggable="false"
                                  style={invertLogo ? {filter: "invert(1)"} : undefined}
                                  onError={(e) => {
                                      e.currentTarget.parentElement?.classList.add("hidden");
                                      e.currentTarget.parentElement?.nextElementSibling?.classList.remove("hidden");
                                  }}
                              />
                            </span>
                                                        <div
                                                            className="hidden w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                            style={{backgroundColor: color}}
                                                        />
                                                    </>
                                                ) : (
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        style={{backgroundColor: color}}
                                                    />
                                                )}
                                                <span
                                                    className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {name}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── PROJECTS ── */}
                <section id="projects" className="py-32 border-t border-border">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                {CONTENT.projects.eyebrow}
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold">
                                Projects
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {PROJECTS.map((project) => (
                                <div
                                    key={project.title}
                                    className="group relative rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Hover gradient overlay */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>

                                    <div className="relative">
                                        <a
                                            href={project.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block font-display font-bold text-xl text-foreground hover:text-primary transition-colors duration-200"
                                        >
                                            {project.title}
                                            <ExternalLink
                                                size={13}
                                                className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity"
                                            />
                                        </a>
                                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 relative">
                                        {project.tech.map((t) => (
                                            <span
                                                key={t}
                                                className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-mono"
                                            >
                        {t}
                      </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 relative mt-auto pt-2 border-t border-border">
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Github size={13}/> {CONTENT.projects.githubLabel}
                                        </a>
                                        <a
                                            href={project.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink size={13}/> {CONTENT.projects.demoLabel}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MUSIC PRODUCTION FOR DUMMIES ── */}
                <section
                    id="music"
                    className="py-32 border-t border-border relative overflow-hidden"
                >
                    {/* Top accent line */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"/>
                    <div
                        className="absolute inset-0 bg-gradient-to-b from-accent/4 via-transparent to-transparent pointer-events-none"/>

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                {CONTENT.music.eyebrow}
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold">
                                {CONTENT.music.heading.first}{" "}
                                <span
                                    className="inline-block bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: "var(--music-gradient)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >{CONTENT.music.heading.accent}</span>
                            </h2>
                            <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                                {CONTENT.music.description}
                            </p>
                        </div>

                        {/* Main feature card */}
                        <div className="rounded-3xl border border-accent/30 bg-card overflow-hidden">
                            {/* Waveform header */}
                            <div
                                className="relative bg-gradient-to-r from-accent/8 via-primary/8 to-accent/8 border-b border-border p-8 overflow-hidden">
                                <div className="absolute inset-0 opacity-25">
                                    <WaveformViz className="w-full h-full"/>
                                </div>

                                <div className="relative flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div
                                            className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/35 flex items-center justify-center flex-shrink-0">
                                            <Headphones size={24} className="text-accent"/>
                                        </div>
                                        <div>
                                            <div className="font-display font-bold text-2xl">
                                                {CONTENT.music.cardTitle}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-mono mt-0.5">
                                                {CONTENT.music.cardSubtitle}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature pillars */}
                            <div className="p-8 grid md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: <Music size={20} className="text-accent"/>,
                                        title: CONTENT.music.features[0].title,
                                        desc: CONTENT.music.features[0].desc,
                                    },
                                    {
                                        icon: (
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="w-5 h-5 text-accent"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            >
                                                <path
                                                    d="M2 12 Q4 6 6 12 Q8 18 10 12 Q12 6 14 12 Q16 18 18 12 Q20 6 22 12"/>
                                            </svg>
                                        ),
                                        title: CONTENT.music.features[1].title,
                                        desc: CONTENT.music.features[1].desc,
                                    },
                                    {
                                        icon: <Volume2 size={20} className="text-accent"/>,
                                        title: CONTENT.music.features[2].title,
                                        desc: CONTENT.music.features[2].desc,
                                    },
                                ].map(({icon, title, desc}) => (
                                    <div key={title} className="flex flex-col gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                            {icon}
                                        </div>
                                        <h3 className="font-display font-semibold text-foreground">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Piano key decorative strip */}
                            <div className="px-8 flex gap-px">
                                {Array.from({length: 28}).map((_, i) => {
                                    const blackPattern = [
                                        false, true, false, true, false, false, true, false, true,
                                        false, true, false,
                                    ];
                                    const isBlack = blackPattern[i % 12];
                                    return (
                                        <div
                                            key={i}
                                            className={
                                                isBlack
                                                    ? "h-4 flex-1 rounded-b bg-muted-foreground/30"
                                                    : "h-6 flex-1 rounded-b bg-muted/60 border-x border-b border-border"
                                            }
                                        />
                                    );
                                })}
                            </div>

                            {/* CTA footer */}
                            <div className="px-8 pb-8 pt-6">
                                <div
                                    className="rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 p-6 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="font-display font-semibold text-foreground">
                                            {CONTENT.music.ctaTitle}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {CONTENT.music.ctaDescription}
                                        </div>
                                    </div>
                                    <a
                                        href={CONTENT.music.ctaHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                                    >
                                        <ExternalLink size={14}/> {CONTENT.music.ctaLabel}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CONTACT ── */}
                <section id="contact" className="py-32 border-t border-border">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left: info */}
                        <div>
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                {CONTENT.contact.eyebrow}
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-[1.1]">
                                {CONTENT.contact.heading.first}{" "}
                                <span className="text-primary">{CONTENT.contact.heading.primary}</span>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-10 max-w-sm">
                                {CONTENT.contact.description}
                            </p>

                            <div className="space-y-3">
                                {CONTENT.contact.links.map(({kind, label, href}) => {
                                    const icon = kind === "email" ? <Mail size={16}/> : kind === "github" ? <Github size={16}/> : <Linkedin size={16}/>;
                                    const isEmail = href.startsWith("mailto:");
                                    return (
                                        <a
                                            key={label}
                                            href={href}
                                            target={isEmail ? undefined : "_blank"}
                                            rel={isEmail ? undefined : "noopener noreferrer"}
                                            className="group flex items-center gap-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/8 transition-all duration-200">
                                                {icon}
                                            </div>
                                            <span className="text-sm">{label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: form */}
                        <div>
                            {formSent ? (
                                <div
                                    className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-accent/30 bg-card min-h-[360px]">
                                    <div
                                        className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-5">
                                        <Send size={24} className="text-accent"/>
                                    </div>
                                    <h3 className="font-display font-bold text-xl mb-2">
                                        {CONTENT.contact.form.successTitle}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {CONTENT.contact.form.successMessage}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setFormSent(false);
                                            setFormError("");
                                        }}
                                        className="mt-6 text-sm text-primary hover:text-primary/75 transition-colors"
                                    >
                                        {CONTENT.contact.form.sendAnother}
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5 rounded-2xl border border-border bg-card p-8"
                                >
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {CONTENT.contact.form.nameLabel}
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({...formData, name: e.target.value})
                                            }
                                            placeholder={CONTENT.contact.form.namePlaceholder}
                                            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {CONTENT.contact.form.emailLabel}
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({...formData, email: e.target.value})
                                            }
                                            placeholder={CONTENT.contact.form.emailPlaceholder}
                                            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {CONTENT.contact.form.messageLabel}
                                        </label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({...formData, message: e.target.value})
                                            }
                                            placeholder={CONTENT.contact.form.messagePlaceholder}
                                            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all resize-none text-sm"
                                        />
                                    </div>

                                    {formError && (
                                        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                            {formError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Send size={15}/> {formSubmitting ? CONTENT.contact.form.submitting : CONTENT.contact.form.submit}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="border-t border-border py-8">
                    <div
                        className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="font-display font-semibold flex items-center gap-2">
                            <img
                                src={idleDuck}
                                alt=""
                                aria-hidden="true"
                                draggable="false"
                                className="h-7 w-7 object-contain"
                                style={{imageRendering: "pixelated"}}
                            />
                            <span><span className="text-primary">{CONTENT.site.brandPrefix}</span>{CONTENT.site.owner}<span className="text-primary">{CONTENT.site.brandSuffix}</span></span>
                        </div>
                        <div className="font-mono text-xs">
                            {CONTENT.footer.note}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
