import {SKILL_CATEGORIES, SKILL_LABELS, SKILLS} from "../data";
import {CONTENT} from "../content";
import type {ThemeMode} from "../theme";

export function SkillsSection({theme}: { theme: ThemeMode }) {
    return (
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
                                {items.map(({name, color, logo, invertLogoThemes, logoBg}) => (
                                    <div
                                        key={name}
                                        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-default ${
                                            theme === "light"
                                                ? ["Python", "C++", "Java", "SQL"].includes(name)
                                                    ? "bg-orange-100 border-accent/55 shadow-[0_10px_26px_rgba(217,119,6,0.10)] hover:bg-accent/10 hover:border-accent/70"
                                                    : "bg-card border-border hover:bg-accent/10 hover:border-accent/55"
                                                : ["Python", "C++", "Java", "SQL"].includes(name)
                                                    ? "bg-primary/12 border-primary/55 shadow-[0_0_18px_rgba(124,58,237,0.18)] hover:bg-primary/18 hover:border-primary/75"
                                                    : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
                                        }`}
                                    >
                                        {logo ? (
                                            <>
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md" style={logoBg ? {backgroundColor: logoBg} : undefined}>
                                                    <img
                                                        src={logo}
                                                        alt=""
                                                        aria-hidden="true"
                                                        className="h-5 w-5 object-contain"
                                                        draggable="false"
                                                        style={invertLogoThemes?.includes(theme) ? {filter: "invert(1)"} : undefined}
                                                        onError={(e) => {
                                                            e.currentTarget.parentElement?.classList.add("hidden");
                                                            e.currentTarget.parentElement?.nextElementSibling?.classList.remove("hidden");
                                                        }}
                                                    />
                                                </span>
                                                <div className="hidden w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: color}}/>
                                            </>
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: color}}/>
                                        )}
                                        <span className="text-sm font-medium text-foreground transition-colors">
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
    );
}
