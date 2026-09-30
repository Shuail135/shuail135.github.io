import {SiApple} from "react-icons/si";
import {Download, Github, Tag} from "lucide-react";

import appIcon from "../../assets/camitune/icon.png";
import {CamiTuneGallery} from "../components/CamiTuneGallery";
import {CONTENT} from "../content";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export function CamiTuneSection() {
    const content = CONTENT.camitune;

    return (
        <section id="camitune" aria-labelledby="camitune-heading" className="camitune-section relative py-24 lg:py-32 border-t border-border">
            <div className="relative max-w-7xl mx-auto px-6">
                <p className="text-center font-mono text-accent text-xs mb-8 tracking-[0.2em] uppercase">
                    {content.eyebrow}
                </p>

                <div className="flex flex-col items-center gap-10 lg:gap-12">
                    <div className="w-full max-w-2xl text-center">
                        <div className="flex flex-col items-center gap-4 mb-5">
                            <img src={appIcon} alt="" width="72" height="72" loading="lazy" className="shrink-0 rounded-2xl"/>
                            <div>
                                <h2 id="camitune-heading" aria-label={content.name} className="font-display font-bold text-4xl sm:text-5xl tracking-tight"><span className="text-primary">Cami</span><span className="text-accent">Tune</span></h2>
                            </div>
                        </div>
                        <p className="font-display font-semibold text-xl sm:text-2xl leading-snug">{content.subtitle}</p>
                        <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">{content.description}</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground">
                                <SiApple size={14} aria-hidden="true"/>{content.requirements}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-mono text-foreground">
                                <Tag size={13} aria-hidden="true"/>{content.version}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <a href={content.downloadHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity ${focusRing}`}>
                                <Download size={17} aria-hidden="true"/>{content.downloadLabel}
                            </a>
                            <a href={content.githubHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:border-primary/50 transition-colors ${focusRing}`}>
                                <Github size={17} aria-hidden="true"/>View source
                            </a>
                        </div>
                    </div>

                    <CamiTuneGallery/>
                </div>
            </div>
        </section>
    );
}
