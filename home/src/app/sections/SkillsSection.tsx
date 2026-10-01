import {useEffect, useRef} from "react";

import darkIdleDuck from "../../../img/dark_rubber_duck_idle.png";


import {SKILL_CATEGORIES, SKILL_LABELS, SKILLS} from "../data";
import {CONTENT} from "../content";
import type {ThemeMode} from "../theme";

export function SkillsSection({theme}: { theme: ThemeMode }) {
    const sectionRef = useRef<HTMLElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);
    const trailPathRef = useRef<SVGPathElement>(null);
    const duckMoverRef = useRef<HTMLDivElement>(null);
    const duckImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const groups = section.querySelectorAll<HTMLElement>("[data-skill-reveal]");
        const revealItems = section.querySelectorAll<HTMLElement>(".skill-reveal-item");
        if (!revealItems.length) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            revealItems.forEach((item) => {
                item.dataset.revealed = "true";
            });
            return;
        }

        const setRowDelays = () => {
            const delays: [HTMLElement, string][] = [];
            groups.forEach((group) => {
                const items = group.querySelectorAll<HTMLElement>(".skill-reveal-item");
                let rowTop: number | null = null;
                let rowOrder = 0;

                items.forEach((item) => {
                    if (item.classList.contains("skill-reveal-title")) {
                        delays.push([item, "0ms"]);
                        return;
                    }

                    const top = item.offsetTop;
                    if (rowTop === null || Math.abs(top - rowTop) > 4) {
                        rowTop = top;
                        rowOrder = 0;
                    }

                    delays.push([item, `${(rowOrder + 1) * 100}ms`]);
                    rowOrder += 1;
                });
            });
            // Read every row position before changing styles to avoid forced layouts.
            delays.forEach(([item, delay]) => item.style.setProperty("--skill-reveal-delay", delay));
        };

        setRowDelays();
        window.addEventListener("resize", setRowDelays);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    (entry.target as HTMLElement).dataset.revealed = "true";
                    observer.unobserve(entry.target);
                });
            },
            {threshold: 0.15, rootMargin: "0px 0px -4% 0px"},
        );

        revealItems.forEach((item) => observer.observe(item));
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", setRowDelays);
        };
    }, []);

    useEffect(() => {
        const trail = trailRef.current;
        const path = trailPathRef.current;
        const mover = duckMoverRef.current;
        const duckImage = duckImageRef.current;
        const svg = path?.ownerSVGElement;
        if (!trail || !path || !mover || !duckImage || !svg) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const normalMaxSpeed = 320;
        const catchUpSpeed = 400;
        const catchUpDelay = 800;
        const settleThreshold = 0.0004;
        let animationFrame = 0;
        let walkingTimer = 0;
        let facing = 1;
        let targetProgress = 0;
        let currentProgress = 0;
        let lastFrameTime = 0;
        let cappedSince: number | null = null;
        let lagDirection = 0;
        const pathLength = path.getTotalLength();
        let trailHeight = 1;
        let xScale = 0;
        let yScale = 0;
        let geometryDirty = true;
        let targetDirty = true;

        const measureGeometry = () => {
            const svgRect = svg.getBoundingClientRect();
            trailHeight = Math.max(trail.getBoundingClientRect().height, 1);
            xScale = svgRect.width / 120;
            yScale = svgRect.height / 1000;
            geometryDirty = false;
        };

        const getTargetProgress = () => {
            const trailRect = trail.getBoundingClientRect();
            if (!trailRect.height) return currentProgress;

            const startLine = window.innerHeight * 0.78;
            const endLine = window.innerHeight * 0.3;
            const travelRange = trailRect.height + startLine - endLine;
            return Math.min(Math.max((startLine - trailRect.top) / travelRange, 0), 1);
        };

        const renderDuckPosition = (progress: number, travelDirection = 1) => {
            if (!xScale || !yScale) return;

            const distance = pathLength * progress;
            const point = path.getPointAtLength(distance);
            const previousPoint = path.getPointAtLength(Math.max(0, distance - 1));
            const nextPoint = path.getPointAtLength(Math.min(pathLength, distance + 1));
            const renderedDx = (nextPoint.x - previousPoint.x) * xScale;
            const renderedDy = (nextPoint.y - previousPoint.y) * yScale;
            const x = point.x * xScale;
            const y = point.y * yScale;
            const movementDx = renderedDx * travelDirection;

            const nextFacing = movementDx < 0 ? -1 : 1;
            if (Math.abs(movementDx) > 0.08 && facing !== nextFacing) {
                facing = nextFacing;
                duckImage.style.setProperty("--skills-duck-facing", String(facing));
            }

            const lean = reduceMotion
                ? 0
                : Math.min(Math.max((movementDx / Math.max(Math.abs(renderedDy), 0.1)) * 24, -14), 14);
            mover.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0) rotate(${lean}deg)`;
        };

        const settleWalkingAnimation = () => {
            window.clearTimeout(walkingTimer);
            walkingTimer = window.setTimeout(() => {
                mover.classList.remove("is-walking", "is-catching-up");
            }, 180);
        };

        const animateTowardsTarget = (time: number) => {
            animationFrame = 0;
            if (geometryDirty) measureGeometry();
            if (targetDirty) {
                targetProgress = getTargetProgress();
                targetDirty = false;
            }
            if (reduceMotion) {
                currentProgress = targetProgress;
                renderDuckPosition(currentProgress);
                return;
            }
            const delta = targetProgress - currentProgress;

            if (Math.abs(delta) <= settleThreshold) {
                currentProgress = targetProgress;
                renderDuckPosition(currentProgress, lagDirection || 1);
                cappedSince = null;
                lastFrameTime = 0;
                settleWalkingAnimation();
                return;
            }

            const elapsed = lastFrameTime
                ? Math.min((time - lastFrameTime) / 1000, 0.05)
                : 1 / 60;
            lastFrameTime = time;
            const direction = Math.sign(delta);
            const normalStep = (normalMaxSpeed / trailHeight) * elapsed;
            const exceedsNormalSpeed = Math.abs(delta) > normalStep;

            if (exceedsNormalSpeed) {
                if (cappedSince === null || direction !== lagDirection) cappedSince = time;
            } else {
                cappedSince = null;
            }
            lagDirection = direction;

            const isCatchingUp = cappedSince !== null && time - cappedSince >= catchUpDelay;
            const speed = isCatchingUp ? catchUpSpeed : normalMaxSpeed;
            const maximumStep = (speed / trailHeight) * elapsed;
            currentProgress += direction * Math.min(Math.abs(delta), maximumStep);

            mover.classList.add("is-walking");
            mover.classList.toggle("is-catching-up", isCatchingUp);
            renderDuckPosition(currentProgress, direction);
            animationFrame = window.requestAnimationFrame(animateTowardsTarget);
        };

        const updateTarget = () => {
            targetDirty = true;
            window.clearTimeout(walkingTimer);
            if (!animationFrame) animationFrame = window.requestAnimationFrame(animateTowardsTarget);
        };

        const updateGeometry = () => {
            geometryDirty = true;
            updateTarget();
        };

        measureGeometry();
        targetProgress = getTargetProgress();
        currentProgress = targetProgress;
        renderDuckPosition(currentProgress);
        window.addEventListener("scroll", updateTarget, {passive: true});
        window.addEventListener("resize", updateGeometry);

        const resizeObserver = new ResizeObserver(updateGeometry);
        resizeObserver.observe(trail);
        resizeObserver.observe(svg);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            window.clearTimeout(walkingTimer);
            window.removeEventListener("scroll", updateTarget);
            window.removeEventListener("resize", updateGeometry);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <section ref={sectionRef} id="skills" data-animation-region className="py-32 border-t border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                        {CONTENT.skills.eyebrow}
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-display font-bold">
                        {CONTENT.skills.heading}
                    </h2>
                </div>

                <div className="relative">
                    <div
                        ref={trailRef}
                        className="skills-duck-trail pointer-events-none absolute inset-y-0 -left-4 z-10 block w-20 select-none sm:-left-6 sm:w-24 md:-left-9 md:w-28"
                        aria-hidden="true"
                    >
                        <svg
                            className="absolute inset-0 h-full w-full overflow-visible"
                            viewBox="0 0 120 1000"
                            preserveAspectRatio="none"
                        >
                            <path
                                ref={trailPathRef}
                                className="skills-duck-motion-path"
                                d="M 45 0 C 78 90 80 175 46 250 C 20 330 22 420 62 500 C 88 580 88 670 46 750 C 20 830 24 920 62 1000"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                className="skills-duck-sand-path skills-duck-path-left"
                                d="M 45 0 C 78 90 80 175 46 250 C 20 330 22 420 62 500 C 88 580 88 670 46 750 C 20 830 24 920 62 1000"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                className="skills-duck-sand-path skills-duck-path-right"
                                d="M 45 0 C 78 90 80 175 46 250 C 20 330 22 420 62 500 C 88 580 88 670 46 750 C 20 830 24 920 62 1000"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                className="skills-duck-space-path"
                                d="M 45 0 C 78 90 80 175 46 250 C 20 330 22 420 62 500 C 88 580 88 670 46 750 C 20 830 24 920 62 1000"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                        <div className="skills-duck-rock-field">
                            <span className="skills-duck-rock skills-duck-rock-one"/>
                            <span className="skills-duck-rock skills-duck-rock-two"/>
                            <span className="skills-duck-rock skills-duck-rock-three"/>
                            <span className="skills-duck-rock skills-duck-rock-four"/>
                            <span className="skills-duck-rock skills-duck-rock-five"/>
                            <span className="skills-duck-rock skills-duck-rock-six"/>
                        </div>
                        <div className="skills-duck-planet-field">
                            <span className="skills-duck-planet skills-duck-planet-one"/>
                            <span className="skills-duck-planet skills-duck-planet-two skills-duck-planet-ringed"/>
                            <span className="skills-duck-planet skills-duck-planet-three"/>
                            <span className="skills-duck-planet skills-duck-planet-four"/>
                            <span className="skills-duck-planet skills-duck-planet-five skills-duck-planet-ringed"/>
                            <span className="skills-duck-planet skills-duck-planet-six"/>
                            <span className="skills-duck-planet skills-duck-planet-seven"/>
                        </div>
                        <div ref={duckMoverRef} className="skills-duck-mover absolute left-0 top-0 h-10 w-10">
                            <div className="skills-duck-waddle h-full w-full">
                                <img
                                    ref={duckImageRef}
                                    src={darkIdleDuck}
                                    alt=""
                                    className="skills-path-duck h-full w-full object-contain"
                                    draggable="false"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pl-12 sm:pl-14 md:pl-16">
                        {SKILL_CATEGORIES.map((category) => {
                            const items = SKILLS.filter((s) => s.category === category);
                            return (
                                <div key={category} data-skill-reveal className="skills-reveal-group mb-10 last:mb-0">
                            <h3
                                className="skill-reveal-item skill-reveal-title text-sm font-mono text-muted-foreground uppercase tracking-[0.14em] mb-4"
                            >
                                {SKILL_LABELS[category]}
                            </h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {items.map(({name, color, logo, invertLogoThemes, logoBg}) => (
                                    <div
                                        key={name}
                                        className={`skill-reveal-item skill-reveal-card group flex items-center border cursor-default ${
                                            logo
                                                ? "w-[calc(33.333333%-0.333333rem)] flex-none flex-col justify-center gap-2 rounded-[6px] px-2 py-3 sm:w-25 sm:px-3"
                                                : "gap-2.5 rounded-[6px] px-4 py-2.5"
                                        } ${
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
                                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg" style={logoBg ? {backgroundColor: logoBg} : undefined}>
                                                    <img
                                                        src={logo}
                                                        alt=""
                                                        aria-hidden="true"
                                                        className="h-10 w-10 object-contain"
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
                                        <span className={`${logo ? "text-center text-xs leading-tight" : "text-sm"} font-medium text-foreground transition-colors`}>
                                            {name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}



