import {useEffect} from "react";

// Pause decorative CSS animations only while their region cannot be seen.
export function useAnimationVisibility() {
    useEffect(() => {
        const root = document.documentElement;
        const regions = document.querySelectorAll<HTMLElement>("[data-animation-region]");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({target, isIntersecting}) => {
                (target as HTMLElement).dataset.animationsPaused = String(!isIntersecting);
            });
        }, {rootMargin: "100px"});
        regions.forEach((region) => observer.observe(region));

        const updateVisibility = () => {
            root.dataset.animationsPaused = String(document.hidden);
        };
        updateVisibility();
        document.addEventListener("visibilitychange", updateVisibility);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", updateVisibility);
            delete root.dataset.animationsPaused;
            regions.forEach((region) => delete region.dataset.animationsPaused);
        };
    }, []);
}
