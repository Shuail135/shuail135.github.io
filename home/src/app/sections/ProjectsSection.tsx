import {ExternalLink, Github} from "lucide-react";

import {CONTENT} from "../content";
import {PROJECTS} from "../data";

export function ProjectsSection() {
    return (
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
                        <div key={project.title} className="group relative rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>

                            <div className="relative">
                                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-block font-display font-bold text-xl text-foreground hover:text-primary transition-colors duration-200">
                                    {project.title}
                                    <ExternalLink size={13} className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity"/>
                                </a>
                                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 relative">
                                {project.tech.map((t) => (
                                    <span key={t} className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-mono">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4 relative mt-auto pt-2 border-t border-border">
                                <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    <Github size={13}/> {CONTENT.projects.githubLabel}
                                </a>
                                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    <ExternalLink size={13}/> {CONTENT.projects.demoLabel}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
