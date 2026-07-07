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
import idleDuck from "../../img/rubber_duck_idle.png";
import clickedDuck1 from "../../img/rubber_duck_clicked1.png";
import clickedDuck2 from "../../img/rubber_duck_clicked2.png";
import submarineWindow from "../../img/submarine_window.png";
import quackSfx from "../../sfx/quack.mp3";
import resumePdf from "../../pdf/Résumé.pdf";

// ── Types ──────────────────────────────────────────────────────────────────
type Section = "home" | "about" | "skills" | "projects" | "music" | "contact";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

const NAV_ITEMS: { id: Section; label: string }[] = [
    {id: "home", label: "Home"},
    {id: "about", label: "About"},
    {id: "skills", label: "Skills"},
    {id: "projects", label: "Projects"},
    {id: "music", label: "Music Production for Dummies"},
    {id: "contact", label: "Contact Me"},
];

function DuckAvatar({
                        triggerRef,
                    }: {
    triggerRef?: { current: (() => void) | null };
}) {
    const idle = idleDuck;
    const clicked1 = clickedDuck1;
    const clicked2 = clickedDuck2;
    const frameDuration = 200;

    const [src, setSrc] = useState(idle);
    const animatingRef = useRef(false);
    const quackRef = useRef<HTMLAudioElement | null>(null);
    const timeoutRefs = useRef<number[]>([]);

    useEffect(() => {
        [idle, clicked1, clicked2].forEach((s) => {
            const im = new Image();
            im.src = s;
        });
        quackRef.current = new Audio(quackSfx);
        quackRef.current.preload = "auto";

        return () => {
            timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
            quackRef.current = null;
        };
    }, [idle, clicked1, clicked2]);


    function clearAnimationTimers() {
        timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
        timeoutRefs.current = [];
    }

    function trigger() {
        clearAnimationTimers();

        const quack = quackRef.current;
        if (quack) {
            try {
                quack.currentTime = 0;
                void quack.play().catch(() => {});
            } catch {
                // Ignore audio state errors; the visual animation should still run.
            }
        }

        animatingRef.current = true;
        setSrc(clicked1);

        const firstTimeout = window.setTimeout(() => {
            setSrc(clicked2);
            const secondTimeout = window.setTimeout(() => {
                setSrc(idle);
                animatingRef.current = false;
            }, frameDuration);
            timeoutRefs.current.push(secondTimeout);
        }, frameDuration);
        timeoutRefs.current.push(firstTimeout);
    }

    useEffect(() => {
        if (!triggerRef) return;
        triggerRef.current = trigger;
        return () => {
            triggerRef.current = null;
        };
    });

    return (
        <div className="w-full h-full flex items-center justify-center">
      <span className="duck-float inline-flex translate-y-3">
        <img
            src={src}
            alt="Rubber duck"
            draggable="false"
            className="w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] object-contain select-none"
            style={{imageRendering: "pixelated"}}
            onPointerDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "")}
            onPointerCancel={(e) => (e.currentTarget.style.transform = "")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
        />
      </span>
        </div>
    );
}

// ── Waveform bars visualization ────────────────────────────────────────────
function WaveformViz({className = ""}: { className?: string }) {
    const heights = [
        18, 32, 52, 68, 44, 78, 58, 38, 72, 88, 62, 48, 82, 68, 42, 28, 58, 72,
        52, 38, 78, 62, 88, 68, 48, 34, 62, 78, 52, 38, 68, 82, 58, 42, 72, 52,
        38, 62, 78, 48, 32, 68, 82, 56, 42, 28, 52, 68, 42, 22,
    ];
    return (
        <svg viewBox="0 0 402 100" className={className} preserveAspectRatio="none">
            <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35"/>
                    <stop offset="35%" stopColor="#06d6a0" stopOpacity="0.9"/>
                    <stop offset="65%" stopColor="#7c3aed" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.35"/>
                </linearGradient>
            </defs>
            {heights.map((h, i) => (
                <rect
                    key={i}
                    x={i * 8 + 2}
                    y={(100 - h) / 2}
                    width="5"
                    height={h}
                    rx="2.5"
                    fill="url(#waveGrad)"
                />
            ))}
        </svg>
    );
}

// ── Data ───────────────────────────────────────────────────────────────────
const SKILLS = [
    {
        name: "Python",
        category: "Language",
        color: "#3776ab",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
    },
    {
        name: "C++",
        category: "Language",
        color: "#00599c",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
    },
    {
        name: "Java",
        category: "Language",
        color: "#f89820",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
    },
    {
        name: "SQL",
        category: "Language",
        color: "#336791",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg"
    },
    {
        name: "C",
        category: "Language",
        color: "#a8b9cc",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"
    },
    {
        name: "C#",
        category: "Language",
        color: "#9b4f96",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"
    },
    {
        name: "JavaScript",
        category: "Language",
        color: "#f7df1e",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
    },
    {
        name: "TypeScript",
        category: "Language",
        color: "#3178c6",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
    },
    {
        name: "GoLang",
        category: "Language",
        color: "#00add8",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
    },
    {
        name: "Prolog",
        category: "Language",
        color: "#74283c",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prolog/prolog-original.svg"
    },
    {
        name: "Scheme",
        category: "Language",
        color: "#9f1d20",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/racket/racket-original.svg"
    },
    {
        name: "HTML",
        category: "Frontend",
        color: "#e34f26",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
    },
    {
        name: "CSS",
        category: "Frontend",
        color: "#1572b6",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
    },
    {
        name: "React",
        category: "Frontend",
        color: "#61dafb",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
    },
    {name: "Tailwind CSS", category: "Frontend", color: "#06b6d4", logo: "https://cdn.simpleicons.org/tailwindcss"},

    {
        name: "Node.js",
        category: "Backend & Databases",
        color: "#5fa04e",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
    },
    {
        name: "Express.js",
        category: "Backend & Databases",
        color: "#999999",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/express.svg",
        invertLogo: true
    },
    {name: "Firebase", category: "Backend & Databases", color: "#ffca28", logo: "https://cdn.simpleicons.org/firebase"},
    {
        name: "MySQL",
        category: "Backend & Databases",
        color: "#4479a1",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
    },
    {
        name: "SQLite",
        category: "Backend & Databases",
        color: "#003b57",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg"
    },
    {
        name: "PostgreSQL",
        category: "Backend & Databases",
        color: "#4169e1",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
    },

    {
        name: "GitHub",
        category: "DevOps & Tools",
        color: "#e0dff8",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
        logoBg: "#f8fafc"
    },
    {
        name: "VS Code",
        category: "DevOps & Tools",
        color: "#007acc",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
    },
    {
        name: "Vercel",
        category: "DevOps & Tools",
        color: "#cccccc",
        logo: "https://cdn.simpleicons.org/vercel",
        logoBg: "#f8fafc"
    },
    {name: "CI/CD", category: "DevOps & Tools", color: "#2088ff", logo: "https://cdn.simpleicons.org/githubactions"},
    {
        name: "Docker",
        category: "DevOps & Tools",
        color: "#2496ed",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
    },
    {
        name: "Android Studio",
        category: "DevOps & Tools",
        color: "#3ddc84",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg"
    },

    {
        name: "Godot",
        category: "Game & Creative Tools",
        color: "#478cbf",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/godot/godot-original.svg"
    },
    {
        name: "Maya",
        category: "Game & Creative Tools",
        color: "#37a5cc",
        logo: "https://cdn.simpleicons.org/autodeskmaya"
    },
    {
        name: "Adobe Photoshop",
        category: "Game & Creative Tools",
        color: "#31a8ff",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobephotoshop.svg",
        invertLogo: true
    },
    {
        name: "Ableton Live",
        category: "Game & Creative Tools",
        color: "#06d6a0",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/abletonlive.svg",
        invertLogo: true
    },
    {name: "GarageBand", category: "Game & Creative Tools", color: "#f97316"},

    {name: "MobileNetV4", category: "AI & ML", color: "#ff6f00"},
    {name: "Tacotron 2", category: "AI & ML", color: "#7c3aed"},
    {name: "Vosk", category: "AI & ML", color: "#2563eb"},
    {name: "Qwen2.5", category: "AI & ML", color: "#0f766e"},
    {name: "Sentence Embeddings", category: "AI & ML", color: "#9333ea"},
    {name: "Cosine Similarity", category: "AI & ML", color: "#0891b2"},

    {name: "Lighting", category: "3D Art Skills", color: "#f59e0b"},
    {name: "Shading", category: "3D Art Skills", color: "#64748b"},
    {name: "UV Mapping", category: "3D Art Skills", color: "#14b8a6"},
    {name: "Basic Modeling", category: "3D Art Skills", color: "#8b5cf6"},
];

const PROJECTS = [
    {
        title: "Project1",
        description:
            "temp",
        tech: ["temp", "temp", "temp"],
        github: "#",
        demo: "#",
    },
    {
        title: "Project2",
        description:
            "temp",
        tech: ["temp", "temp", "temp", "temp"],
        github: "#",
        demo: "#",
    },
    {
        title: "Project3",
        description:
            "temp",
        tech: ["temp", "temp", "temp"],
        github: "#",
        demo: "#",
    },
    {
        title: "Project4",
        description:
            "temp",
        tech: ["temp", "temp", "temp"],
        github: "#",
        demo: "#",
    },
];

const SKILL_LABELS: Record<string, string> = {
    Language: "Languages",
    Frontend: "Frontend",
    "Backend & Databases": "Backend & Databases",
    "DevOps & Tools": "DevOps & Tools",
    "Game & Creative Tools": "Game & Creative Tools",
    "AI & ML": "AI & ML",
    "3D Art Skills": "3D Art Skills",
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
    const [activeSection, setActiveSection] = useState<Section>("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [formSent, setFormSent] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const duckTriggerRef = useRef<(() => void) | null>(null);

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
            setFormError("Contact form is missing its Web3Forms access key.");
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
                throw new Error(result.message || "Message could not be sent.");
            }

            setFormSent(true);
            setFormData({name: "", email: "", message: ""});
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Message could not be sent.");
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050712] text-foreground font-sans">
            <div className="space-backdrop fixed inset-0 pointer-events-none"/>
            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050712]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
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
                        <span><span className="text-primary">{"<"}</span>Sum Yan Wan<span className="text-primary">{"/>"}</span></span>
                    </button>

                    {/* Desktop nav */}
                    <div className="hidden lg:flex items-center gap-0.5">
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

                    {/* Hamburger */}
                    <button
                        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
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
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"/>
                                Open to opportunities
                            </div>

                            <h1 className="text-5xl lg:text-[4.5rem] font-display font-extrabold leading-[1.06] tracking-tight mb-6">
                                Hi, I'm{" "}
                                <span
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a855f7 0%, #7c3aed 40%, #06d6a0 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                  Sum Yan Wan
                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[480px]">
                                temp temp temp
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="https://github.com/Shuail135"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Github size={15}/> GitHub
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/sum-yan-wan-600245283/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Linkedin size={15}/> LinkedIn
                                </a>
                                <a
                                    href={resumePdf}
                                    download="Sum-Yan-Wan-Resume.pdf"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Download size={15}/> Résumé
                                </a>
                                <button
                                    onClick={() => scrollTo("projects")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Folder size={15}/> Projects
                                </button>
                                <button
                                    onClick={() => scrollTo("contact")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200"
                                >
                                    <Mail size={15}/> Contact Me
                                </button>
                            </div>
                        </div>

                        {/* Avatar side */}
                        <div className="order-1 lg:order-2 flex justify-center">
                            <div className="relative isolate w-64 h-64 [--avatar-size:16rem] lg:w-[380px] lg:h-[380px] lg:[--avatar-size:380px]">
                                {/* Slow orbit rings */}
                                <div
                                    className="pointer-events-none absolute -inset-[2%] z-30 rounded-full border border-primary/20"
                                    style={{
                                        animation: "spin 22s linear infinite",
                                    }}
                                >
                                    <div
                                        className="pixel-jellyfish pixel-jellyfish-accent absolute top-0 left-1/2 z-[60] -translate-x-1/2 -translate-y-1/2"/>
                                </div>
                                <div
                                    className="pointer-events-none absolute inset-[6.5%] z-50 rounded-full border border-accent/15"
                                    style={{
                                        animation: "spin 16s linear infinite reverse",
                                    }}
                                >
                                    <div
                                        className="pixel-jellyfish pixel-jellyfish-primary absolute bottom-0 left-1/2 z-[60] -translate-x-1/2 translate-y-1/2"/>
                                </div>
                                {/* Avatar container */}
                                <div
                                    className="absolute inset-[15.625%] rounded-full overflow-hidden border border-primary/25 shadow-2xl shadow-primary/15 bg-card">
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
                                        <DuckAvatar triggerRef={duckTriggerRef}/>
                                    </div>
                                </div>
                                <div
                                    className="absolute inset-[15.625%] z-40 cursor-pointer overflow-visible"
                                    onClick={() => duckTriggerRef.current?.()}
                                    aria-hidden="true"
                                >
                                    <img
                                        src={submarineWindow}
                                        alt=""
                                        aria-hidden="true"
                                        draggable="false"
                                        className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain"
                                        style={{imageRendering: "pixelated", maxWidth: "none"}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll hint */}
                    <div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 text-xs pointer-events-none">
            <span className="font-mono tracking-widest uppercase text-[10px]">
              scroll
            </span>
                        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent"/>
                    </div>

                    <style>{`
            .space-backdrop {
              z-index: 0;
              background:
                radial-gradient(circle at 20% 18%, rgba(124, 58, 237, 0.16), transparent 28%),
                radial-gradient(circle at 78% 28%, rgba(6, 182, 212, 0.11), transparent 24%),
                radial-gradient(circle at 52% 86%, rgba(217, 70, 239, 0.1), transparent 28%),
                linear-gradient(180deg, #050712 0%, #090b1c 48%, #050712 100%);
            }

            .space-backdrop::before,
            .space-backdrop::after,
            .pixel-stars {
              content: "";
              position: absolute;
              inset: 0;
              image-rendering: pixelated;
            }

            .space-backdrop::before {
              background-image:
                radial-gradient(circle at 11% 18%, rgba(255,255,255,0.62) 0 1px, transparent 1.5px),
                radial-gradient(circle at 27% 64%, rgba(147,197,253,0.48) 0 1px, transparent 1.6px),
                radial-gradient(circle at 42% 31%, rgba(255,255,255,0.52) 0 1.2px, transparent 1.8px),
                radial-gradient(circle at 66% 72%, rgba(186,230,253,0.5) 0 1px, transparent 1.5px),
                radial-gradient(circle at 83% 22%, rgba(255,255,255,0.58) 0 1.1px, transparent 1.8px);
              background-size: 293px 241px, 367px 311px, 431px 353px, 509px 421px, 587px 463px;
              background-position: 13px 29px, 91px 47px, 37px 113px, 149px 71px, 5px 181px;
              opacity: 0.72;
            }

            .space-backdrop::after {
              background-image:
                radial-gradient(circle at 18% 42%, rgba(216,180,254,0.5) 0 1px, transparent 1.5px),
                radial-gradient(circle at 54% 17%, rgba(255,255,255,0.46) 0 1px, transparent 1.6px),
                radial-gradient(circle at 72% 58%, rgba(125,211,252,0.42) 0 1.1px, transparent 1.7px),
                radial-gradient(circle at 92% 83%, rgba(255,255,255,0.4) 0 0.8px, transparent 1.4px);
              background-size: 641px 389px, 487px 557px, 733px 467px, 379px 619px;
              background-position: 101px 0, 31px 83px, 211px 117px, 17px 241px;
              opacity: 0.7;
            }

            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes duckFloat {
              0%, 100% { transform: translateY(0); }
              25% { transform: translateY(-4px); }
              50% { transform: translateY(-6px); }
              75% { transform: translateY(-2px); }
            }

            @keyframes waterDriftSlow {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 0 8px, 6px 0; }
            }

            @keyframes waterDriftMedium {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 8px 0, 0 6px; }
            }

            @keyframes waterDriftFast {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 6px 0, 0 8px; }
            }

            @keyframes waterDriftSpeckles {
              0% { background-position: 0 0; }
              100% { background-position: 8px 6px; }
            }

            .duck-float {
              animation: duckFloat 2.4s steps(4, end) infinite;
              will-change: transform;
            }

            .water-drift-slow {
              animation: waterDriftSlow 5.6s steps(4, end) infinite alternate;
            }

            .water-drift-medium {
              animation: waterDriftMedium 4.8s steps(4, end) infinite alternate;
            }

            .water-drift-fast {
              animation: waterDriftFast 4.2s steps(3, end) infinite alternate;
            }

            .water-drift-speckles {
              animation: waterDriftSpeckles 6s steps(3, end) infinite alternate;
            }

            .pixel-jellyfish {
              --jelly-pixel: calc(var(--avatar-size) * 0.0211);
              width: calc(var(--jelly-pixel) * 6);
              height: calc(var(--jelly-pixel) * 6);
              image-rendering: pixelated;
              filter: drop-shadow(0 0 0.33em currentColor);
              color: #67e8f9;
            }

            .pixel-jellyfish::before,
            .pixel-jellyfish::after {
              content: "";
              position: absolute;
              left: 0;
              top: 0;
              width: var(--jelly-pixel);
              height: var(--jelly-pixel);
              background: currentColor;
            }

            .pixel-jellyfish::before {
              box-shadow:
                calc(var(--jelly-pixel) * 2) 0 currentColor,
                calc(var(--jelly-pixel) * 3) 0 currentColor,
                var(--jelly-pixel) var(--jelly-pixel) currentColor,
                calc(var(--jelly-pixel) * 2) var(--jelly-pixel) currentColor,
                calc(var(--jelly-pixel) * 3) var(--jelly-pixel) currentColor,
                calc(var(--jelly-pixel) * 4) var(--jelly-pixel) currentColor,
                var(--jelly-pixel) calc(var(--jelly-pixel) * 2) currentColor,
                calc(var(--jelly-pixel) * 2) calc(var(--jelly-pixel) * 2) currentColor,
                calc(var(--jelly-pixel) * 3) calc(var(--jelly-pixel) * 2) currentColor,
                calc(var(--jelly-pixel) * 4) calc(var(--jelly-pixel) * 2) currentColor,
                0 calc(var(--jelly-pixel) * 3) currentColor,
                calc(var(--jelly-pixel) * 2) calc(var(--jelly-pixel) * 3) currentColor,
                calc(var(--jelly-pixel) * 4) calc(var(--jelly-pixel) * 3) currentColor,
                calc(var(--jelly-pixel) * 5) calc(var(--jelly-pixel) * 3) currentColor;
            }

            .pixel-jellyfish::after {
              color: rgba(224, 242, 254, 0.85);
              box-shadow:
                calc(var(--jelly-pixel) * 2) var(--jelly-pixel) currentColor,
                calc(var(--jelly-pixel) * 3) var(--jelly-pixel) currentColor,
                var(--jelly-pixel) calc(var(--jelly-pixel) * 4) currentColor,
                calc(var(--jelly-pixel) * 2) calc(var(--jelly-pixel) * 5) currentColor,
                calc(var(--jelly-pixel) * 3) calc(var(--jelly-pixel) * 4) currentColor,
                calc(var(--jelly-pixel) * 4) calc(var(--jelly-pixel) * 5) currentColor;
            }
            .pixel-jellyfish-accent {
              --jelly-pixel: calc(var(--avatar-size) * 0.019);
              color: #67e8f9;
            }

            .pixel-jellyfish-primary {
              --jelly-pixel: calc(var(--avatar-size) * 0.0120);
              color: #a78bfa;
              transform: translate(-50%, 20%);
            }
          `}</style>
                </section>

                {/* ── ABOUT ── */}
                <section id="about" className="py-32 border-t border-border">
                    <div className="max-w-3xl mx-auto px-6">
                        {/* Bio text */}
                        <div>
                            <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                                About Me
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-8 leading-[1.1]">
                                temp1{" "}
                                <span className="text-primary">temp2</span>{" "}
                                <span className="text-muted-foreground font-normal">temp3</span>{" "}
                                <span className="text-accent">temp4</span>
                            </h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    temp1
                                </p>
                                <p>
                                    temp2
                                </p>
                                <p>
                                    temp3
                                </p>
                            </div>
                            <button
                                onClick={() => scrollTo("contact")}
                                className="mt-8 inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary/75 transition-colors group"
                            >
                                Let's talk
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
                                What I Work With
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold">
                                Skills & Tools
                            </h2>
                        </div>

                        {(
                            [
                                "Language",
                                "Frontend",
                                "Backend & Databases",
                                "DevOps & Tools",
                                "Game & Creative Tools",
                                "AI & ML",
                                "3D Art Skills",
                            ] as const
                        ).map((category) => {
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
                                What I've Built
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
                                            href="#"
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
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Github size={13}/> View on GitHub
                                        </a>
                                        <a
                                            href={project.demo}
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink size={13}/> Live Demo
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
                                Featured Project
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold">
                                Music Production{" "}
                                <span
                                    style={{
                                        background: "linear-gradient(90deg, #06d6a0, #34d399)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                  for Dummies
                </span>
                            </h2>
                            <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                                temp
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
                                                Music Production for Dummies
                                            </div>
                                            <div className="text-sm text-muted-foreground font-mono mt-0.5">
                                                temp
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
                                        title: "title 1",
                                        desc: "temp",
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
                                        title: "title2",
                                        desc: "temp",
                                    },
                                    {
                                        icon: <Volume2 size={20} className="text-accent"/>,
                                        title: "title3",
                                        desc: "temp",
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
                                            Ready to start making music?
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            Not done yet.
                                        </div>
                                    </div>
                                    <a
                                        href="https://shuail135.github.io/music-production-for-dummies/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                                    >
                                        <ExternalLink size={14}/> Visit the Site
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
                                Get in Touch
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-[1.1]">
                                Let's work on something{" "}
                                <span className="text-primary">together</span>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-10 max-w-sm">
                                Whether you have a project in mind, want to collaborate, or just
                                want to say hi — my inbox is always open.
                            </p>

                            <div className="space-y-3">
                                {[
                                    {
                                        icon: <Mail size={16}/>,
                                        label: "sumyanwan@gmail.com",
                                        href: "mailto:sumyanwan@gmail.com",
                                    },
                                    {
                                        icon: <Github size={16}/>,
                                        label: "github.com/Shuail135",
                                        href: "https://github.com/Shuail135",
                                    },
                                    {
                                        icon: <Linkedin size={16}/>,
                                        label: "linkedin.com/in/sum-yan-wan",
                                        href: "https://www.linkedin.com/in/sum-yan-wan-600245283/",
                                    },
                                ].map(({icon, label, href}) => {
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
                                        Message sent!
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        Thanks for reaching out — I'll get back to you soon.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setFormSent(false);
                                            setFormError("");
                                        }}
                                        className="mt-6 text-sm text-primary hover:text-primary/75 transition-colors"
                                    >
                                        Send another message
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
                                            Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({...formData, name: e.target.value})
                                            }
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({...formData, email: e.target.value})
                                            }
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            Enquiry / Message
                                        </label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({...formData, message: e.target.value})
                                            }
                                            placeholder="Tell me about your project, ask a question, or just say hello..."
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
                                        <Send size={15}/> {formSubmitting ? "Sending..." : "Send Message"}
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
                            <span><span className="text-primary">{"<"}</span>Sum Yan Wan<span className="text-primary">{"/>"}</span></span>
                        </div>
                        <div className="font-mono text-xs">
                            temp
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
