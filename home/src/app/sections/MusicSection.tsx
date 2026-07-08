import {ExternalLink, Headphones, Music, Volume2} from "lucide-react";

import {CONTENT} from "../content";
import type {ThemeMode} from "../theme";
import {WaveformViz} from "../components/WaveformViz";

const BLACK_KEY_PATTERN = [
    false, true, false, true, false, false, true, false, true,
    false, true, false,
];

export function MusicSection({theme}: { theme: ThemeMode }) {
    return (
        <section id="music" className="py-32 border-t border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"/>
            <div className="absolute inset-0 bg-gradient-to-b from-accent/4 via-transparent to-transparent pointer-events-none"/>

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

                <div className="rounded-3xl border border-accent/30 bg-card overflow-hidden">
                    <div className="relative bg-gradient-to-r from-accent/8 via-primary/8 to-accent/8 border-b border-border p-8 overflow-hidden">
                        <div className="absolute inset-0 opacity-25">
                            <WaveformViz className="w-full h-full"/>
                        </div>

                        <div className="relative flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/35 flex items-center justify-center flex-shrink-0">
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

                    <div className="p-8 grid md:grid-cols-3 gap-8">
                        {[
                            {icon: <Music size={20} className="text-accent"/>, title: CONTENT.music.features[0].title, desc: CONTENT.music.features[0].desc},
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M2 12 Q4 6 6 12 Q8 18 10 12 Q12 6 14 12 Q16 18 18 12 Q20 6 22 12"/>
                                    </svg>
                                ),
                                title: CONTENT.music.features[1].title,
                                desc: CONTENT.music.features[1].desc,
                            },
                            {icon: <Volume2 size={20} className="text-accent"/>, title: CONTENT.music.features[2].title, desc: CONTENT.music.features[2].desc},
                        ].map(({icon, title, desc}) => (
                            <div key={title} className="flex flex-col gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    {icon}
                                </div>
                                <h3 className="font-display font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="px-8 flex gap-px">
                        {Array.from({length: 28}).map((_, i) => {
                            const isBlack = BLACK_KEY_PATTERN[i % 12];
                            return (
                                <div
                                    key={i}
                                    className={
                                        isBlack
                                            ? theme === "light"
                                                ? "h-4 flex-1 rounded-b bg-neutral-300"
                                                : "h-4 flex-1 rounded-b bg-muted-foreground/30"
                                            : theme === "light"
                                                ? "h-6 flex-1 rounded-b bg-orange-50 border-x border-b border-orange-200"
                                                : "h-6 flex-1 rounded-b bg-muted/60 border-x border-b border-border"
                                    }
                                />
                            );
                        })}
                    </div>

                    <div className="px-8 pb-8 pt-6">
                        <div className={`rounded-2xl border border-accent/20 p-6 flex flex-wrap items-center justify-between gap-4 ${
                            theme === "light" ? "bg-gradient-to-r from-accent/10 to-card" : "bg-gradient-to-r from-accent/10 to-primary/10"
                        }`}>
                            <div>
                                <div className="font-display font-semibold text-foreground">{CONTENT.music.ctaTitle}</div>
                                <div className="text-sm text-muted-foreground mt-1">{CONTENT.music.ctaDescription}</div>
                            </div>
                            <a href={CONTENT.music.ctaHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                                <ExternalLink size={14}/> {CONTENT.music.ctaLabel}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
