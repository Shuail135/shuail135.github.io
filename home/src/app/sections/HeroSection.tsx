import {ChevronRight, Download, Folder, Github, Linkedin, Mail} from "lucide-react";

import resumePdf from "../../../pdf/Résumé.pdf";
import {CONTENT} from "../content";
import type {Section} from "../types";
import {AvatarScene} from "../components/Avatar";

type HeroSectionProps = {
    theme: "dark" | "light";
    avatarTriggerRef: { current: (() => void) | null };
    onScrollTo: (id: Section) => void;
};

export function HeroSection({theme, avatarTriggerRef, onScrollTo}: HeroSectionProps) {
    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none">
                {theme === "dark" && (
                    <>
                        <div className="absolute -top-28 left-1/4 w-[560px] h-[560px] rounded-full bg-violet-600/16 blur-3xl"/>
                        <div className="absolute top-1/3 right-1/6 w-[420px] h-[420px] rounded-full bg-cyan-400/10 blur-3xl"/>
                        <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] rounded-full bg-fuchsia-500/10 blur-3xl"/>
                    </>
                )}
                <div className="pixel-stars absolute inset-0 opacity-70"/>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-10 lg:pb-16 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center w-full">
                <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                        {CONTENT.hero.status}
                    </div>

                    <h1 className="text-5xl lg:text-[4.5rem] font-display font-extrabold leading-[1.06] tracking-tight mb-6">
                        {CONTENT.hero.greetingPrefix}{" "}
                        <span
                            className="hero-name inline-block bg-clip-text text-transparent"
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
                        <a href={CONTENT.hero.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200">
                            <Github size={15}/> {CONTENT.hero.actions.github}
                        </a>
                        <a href={CONTENT.hero.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200">
                            <Linkedin size={15}/> {CONTENT.hero.actions.linkedin}
                        </a>
                        <a href={resumePdf} download="Sum-Yan-Wan-Resume.pdf" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200">
                            <Download size={15}/> {CONTENT.hero.actions.resume}
                        </a>
                        <button onClick={() => onScrollTo("projects")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-200">
                            <Folder size={15}/> {CONTENT.hero.actions.projects}
                        </button>
                        <button onClick={() => onScrollTo("contact")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200">
                            <Mail size={15}/> {CONTENT.hero.actions.contact}
                        </button>
                    </div>
                </div>

                <div className="order-1 lg:order-2 flex justify-center">
                    <AvatarScene triggerRef={avatarTriggerRef}/>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 text-xs pointer-events-none">
                <span className="font-mono tracking-widest uppercase text-[10px]">
                    {CONTENT.hero.scrollHint}
                </span>
                <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent"/>
            </div>
        </section>
    );
}

export function AboutSection({onScrollTo}: { onScrollTo: (id: Section) => void }) {
    return (
        <section id="about" className="py-32 border-t border-border">
            <div className="max-w-3xl mx-auto px-6">
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
                        {CONTENT.about.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                    <button onClick={() => onScrollTo("contact")} className="mt-8 inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary/75 transition-colors group">
                        {CONTENT.about.cta}
                        <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        </section>
    );
}
