import {useEffect} from "react";

import type {Section} from "../types";

const OBSERVED_SECTIONS: Section[] = [
    "home",
    "about",
    "skills",
    "projects",
    "music",
    "contact",
];

export function useActiveSection(setActiveSection: (section: Section) => void) {
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        OBSERVED_SECTIONS.forEach((id) => {
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
    }, [setActiveSection]);
}
