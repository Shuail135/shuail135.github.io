import {memo, useCallback, useRef, useState} from "react";

import {Footer} from "./components/Footer";
import {idleDucks} from "./components/Avatar";
import {Navigation} from "./components/Navigation";
import {useActiveSection} from "./hooks/useActiveSection";
import {useAnimationVisibility} from "./hooks/useAnimationVisibility";
import {useLightBackdrop} from "./hooks/useLightBackdrop";
import {useThemeController} from "./hooks/useThemeController";
import {AboutSection, HeroSection} from "./sections/HeroSection";
import {ContactSection} from "./sections/ContactSection";
import {CamiTuneSection} from "./sections/CamiTuneSection";
import {ProjectsSection} from "./sections/ProjectsSection";
import {SkillsSection} from "./sections/SkillsSection";
import type {Section} from "./types";

export default function App() {
    const [activeSection, setActiveSection] = useState<Section>("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    const {theme, toggleTheme} = useThemeController();
    const themedIdleDuck = idleDucks[theme];

    useLightBackdrop(backdropRef, theme);
    useAnimationVisibility();
    useActiveSection(setActiveSection);

    const scrollTo = useCallback((id: Section) => {
        document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
        setActiveSection(id);
        setMenuOpen(false);
    }, []);

    return (
        <div className={`relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans ${theme}`}>
            <div ref={backdropRef} className="space-backdrop fixed inset-0 pointer-events-none"/>
            <Navigation
                activeSection={activeSection}
                menuOpen={menuOpen}
                duckSrc={themedIdleDuck}
                onMenuOpenChange={setMenuOpen}
                onScrollTo={scrollTo}
                onThemeToggle={toggleTheme}
                theme={theme}
            />

            <PageContent theme={theme} onScrollTo={scrollTo}/>
        </div>
    );
}

// Navigation highlights and menu state should not rerender the page's graphics.
const PageContent = memo(function PageContent({theme, onScrollTo}: {
    theme: "dark" | "light";
    onScrollTo: (id: Section) => void;
}) {
    const avatarTriggerRef = useRef<(() => void) | null>(null);

    return (
        <main className="relative z-10 pt-16">
            <HeroSection theme={theme} avatarTriggerRef={avatarTriggerRef} onScrollTo={onScrollTo}/>
            <AboutSection onScrollTo={onScrollTo}/>
            <SkillsSection theme={theme}/>
            <CamiTuneSection/>
            <ProjectsSection/>
            <ContactSection/>
            <Footer duckSrc={idleDucks[theme]}/>
        </main>
    );
});
