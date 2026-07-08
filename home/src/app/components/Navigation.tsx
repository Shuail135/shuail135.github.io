import {Menu, X} from "lucide-react";

import {CONTENT} from "../content";
import {NAV_ITEMS} from "../data";
import type {Section} from "../types";
import {ThemeToggle} from "./ThemeToggle";

type NavigationProps = {
    activeSection: Section;
    menuOpen: boolean;
    duckSrc: string;
    onMenuOpenChange: (open: boolean) => void;
    onScrollTo: (id: Section) => void;
    onThemeToggle: () => void;
    theme: "dark" | "light";
};

export function Navigation({
                               activeSection,
                               menuOpen,
                               duckSrc,
                               onMenuOpenChange,
                               onScrollTo,
                               onThemeToggle,
                               theme,
                           }: NavigationProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-6">
                <button
                    onClick={() => onScrollTo("home")}
                    className="font-display font-bold text-lg tracking-tight text-foreground flex flex-shrink-0 items-center gap-2"
                >
                    <img
                        src={duckSrc}
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                        className="h-8 w-8 object-contain"
                        style={{imageRendering: "pixelated"}}
                    />
                    <span><span className="text-primary">{CONTENT.site.brandPrefix}</span>{CONTENT.site.owner}<span className="text-primary">{CONTENT.site.brandSuffix}</span></span>
                </button>

                <div className="hidden lg:flex items-center gap-1 ml-auto">
                    {NAV_ITEMS.map(({id, label}) => (
                        <button
                            key={id}
                            onClick={() => onScrollTo(id)}
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
                    <ThemeToggle theme={theme} onToggle={onThemeToggle}/>
                    <button
                        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => onMenuOpenChange(!menuOpen)}
                        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                    >
                        {menuOpen ? <X size={20}/> : <Menu size={20}/>} 
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="lg:hidden border-t border-border bg-background/96 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
                        {NAV_ITEMS.map(({id, label}) => (
                            <button
                                key={id}
                                onClick={() => onScrollTo(id)}
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
    );
}
