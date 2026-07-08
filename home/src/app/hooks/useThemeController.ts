import {useLayoutEffect, useState} from "react";
import {flushSync} from "react-dom";

import {idleDucks} from "../components/Avatar";
import {applyThemePreference, getStoredTheme, type ThemeMode} from "../theme";

type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => void) => {
        finished: Promise<void>;
    };
};

export function useThemeController() {
    const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

    useLayoutEffect(() => {
        applyThemePreference(theme);

        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (favicon) favicon.href = idleDucks[theme];
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!startViewTransition || prefersReducedMotion) {
            setTheme(nextTheme);
            return;
        }

        document.documentElement.classList.add("theme-wipe-active");
        const transition = startViewTransition.call(document, () => {
            flushSync(() => setTheme(nextTheme));
        });

        transition.finished.finally(() => {
            document.documentElement.classList.remove("theme-wipe-active");
        });
    };

    return {theme, toggleTheme};
}
