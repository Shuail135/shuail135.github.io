import {useLayoutEffect, type RefObject} from "react";

import type {ThemeMode} from "../theme";

export function useLightBackdrop(backdropRef: RefObject<HTMLDivElement>, theme: ThemeMode) {
    useLayoutEffect(() => {
        const backdrop = backdropRef.current;
        if (!backdrop || theme !== "light") return;

        let frameId = 0;
        const previousValues = new Map<string, string>();

        const setProperty = (name: string, value: string) => {
            if (previousValues.get(name) === value) return;
            // Keep scroll-dependent variables away from the rest of the page tree.
            backdrop.style.setProperty(name, value);
            previousValues.set(name, value);
        };

        const updateLightBackdrop = () => {
            frameId = 0;
            const scrollingElement = document.scrollingElement ?? document.documentElement;
            const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
            const maxScroll = Math.max(
                scrollingElement.scrollHeight - viewportHeight,
                1
            );
            const scrollY = Math.min(Math.max(window.scrollY, 0), maxScroll);
            const transitionDistance = Math.max(viewportHeight * 5.8, 1);
            const progress = Math.min(Math.max((scrollY - viewportHeight * 0.12) / transitionDistance, 0), 1);
            const easedProgress = progress * progress * (3 - 2 * progress);
            const oceanOffset = 50 - easedProgress * 59;
            const oceanOpacity = 0.22 + easedProgress * 0.48;
            const sandOpacity = 1 - easedProgress * 0.18;

            setProperty("--light-ocean-offset", `${oceanOffset}vh`);
            setProperty("--light-ocean-opacity", oceanOpacity.toFixed(3));
            setProperty("--light-sand-opacity", sandOpacity.toFixed(3));
        };

        const scheduleUpdate = () => {
            if (!frameId) frameId = window.requestAnimationFrame(updateLightBackdrop);
        };

        updateLightBackdrop();
        window.addEventListener("scroll", scheduleUpdate, {passive: true});
        window.addEventListener("resize", scheduleUpdate);
        window.visualViewport?.addEventListener("resize", scheduleUpdate);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            window.visualViewport?.removeEventListener("resize", scheduleUpdate);
        };
    }, [backdropRef, theme]);
}
