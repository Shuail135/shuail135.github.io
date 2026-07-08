import {useRef, useState} from "react";

import {Footer} from "./components/Footer";
import {idleDucks} from "./components/Avatar";
import {Navigation} from "./components/Navigation";
import {useActiveSection} from "./hooks/useActiveSection";
import {useContactForm} from "./hooks/useContactForm";
import {useLightBackdrop} from "./hooks/useLightBackdrop";
import {useThemeController} from "./hooks/useThemeController";
import {AboutSection, HeroSection} from "./sections/HeroSection";
import {ContactSection} from "./sections/ContactSection";
import {MusicSection} from "./sections/MusicSection";
import {ProjectsSection} from "./sections/ProjectsSection";
import {SkillsSection} from "./sections/SkillsSection";
import type {Section} from "./types";

export default function App() {
    const [activeSection, setActiveSection] = useState<Section>("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const avatarTriggerRef = useRef<(() => void) | null>(null);

    const {theme, toggleTheme} = useThemeController();
    const contactForm = useContactForm();
    const themedIdleDuck = idleDucks[theme];

    useLightBackdrop();
    useActiveSection(setActiveSection);

    const scrollTo = (id: Section) => {
        document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
        setActiveSection(id);
        setMenuOpen(false);
    };

    return (
        <div className={`relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans ${theme}`}>
            <div className="space-backdrop fixed inset-0 pointer-events-none"/>
            <Navigation
                activeSection={activeSection}
                menuOpen={menuOpen}
                duckSrc={themedIdleDuck}
                onMenuOpenChange={setMenuOpen}
                onScrollTo={scrollTo}
                onThemeToggle={toggleTheme}
                theme={theme}
            />

            <main className="relative z-10 pt-16">
                <HeroSection theme={theme} avatarTriggerRef={avatarTriggerRef} onScrollTo={scrollTo}/>
                <AboutSection onScrollTo={scrollTo}/>
                <SkillsSection theme={theme}/>
                <ProjectsSection/>
                <MusicSection theme={theme}/>
                <ContactSection
                    formData={contactForm.formData}
                    setFormData={contactForm.setFormData}
                    formSent={contactForm.formSent}
                    formSubmitting={contactForm.formSubmitting}
                    formError={contactForm.formError}
                    onSubmit={contactForm.handleSubmit}
                    onReset={contactForm.resetForm}
                />
                <Footer duckSrc={themedIdleDuck}/>
            </main>
        </div>
    );
}
