import {useEffect} from "react";

export function useLightBackdrop() {
    useEffect(() => {
        let frameId = 0;

        const updateLightBackdrop = () => {
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

            document.documentElement.style.setProperty("--light-ocean-offset", `${oceanOffset}vh`);
            document.documentElement.style.setProperty("--light-ocean-opacity", oceanOpacity.toFixed(3));
            document.documentElement.style.setProperty("--light-sand-opacity", sandOpacity.toFixed(3));
            document.documentElement.style.setProperty("--light-scroll-progress", easedProgress.toFixed(3));
        };

        const scheduleUpdate = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updateLightBackdrop);
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
    }, []);
}
