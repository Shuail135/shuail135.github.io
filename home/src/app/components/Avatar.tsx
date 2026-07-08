import {useEffect, useRef, useState} from "react";

import darkIdleDuck from "../../../img/dark_rubber_duck_idle.png";
import darkClickedDuck1 from "../../../img/dark_rubber_duck_clicked1.png";
import darkClickedDuck2 from "../../../img/dark_rubber_duck_clicked2.png";

import lightIdleDuck from "../../../img/light_rubber_duck_idle.png";
import lightClickedDuck1 from "../../../img/light_rubber_duck_clicked1.png";
import lightClickedDuck2 from "../../../img/light_rubber_duck_clicked2.png";

import quackSfx from "../../../sfx/quack.mp3";

import {
    getStoredTheme,
    isThemeMode,
    THEME_CHANGE_EVENT,
    type ThemeMode,
} from "../theme";

export const idleDucks: Record<ThemeMode, string> = {
    dark: darkIdleDuck,
    light: lightIdleDuck,
};

const duckFrames: Record<
    ThemeMode,
    {
        idle: string;
        clicked1: string;
        clicked2: string;
    }
> = {
    dark: {
        idle: idleDucks.dark,
        clicked1: darkClickedDuck1,
        clicked2: darkClickedDuck2,
    },
    light: {
        idle: idleDucks.light,
        clicked1: lightClickedDuck1,
        clicked2: lightClickedDuck2,
    },
};


function PixelCreature({className}: { className: string }) {
    return (
        <div className={className}>
            <span className="pixel-creature-tentacle-right"/>
        </div>
    );
}

export function AvatarScene({
                                triggerRef,
                            }: {
    triggerRef: { current: (() => void) | null };
}) {
    return (
        <div className="avatar-scene-frame relative isolate">
            <div
                className="pointer-events-none absolute -inset-[2%] z-0 rounded-full border avatar-orbit-ring-outer"
                style={{animation: "spin 28s linear infinite"}}
            >
                <PixelCreature className="pixel-creature pixel-creature-accent absolute top-0 left-1/2 z-[60] -translate-x-1/2 -translate-y-1/2"/>
            </div>
            <div
                className="pointer-events-none absolute inset-[6.5%] z-0 rounded-full border avatar-orbit-ring-inner"
                style={{animation: "spin 20s linear infinite reverse"}}
            />
            <div className="absolute inset-[15.625%] z-20 rounded-full overflow-hidden border border-primary/25 shadow-2xl shadow-primary/15 bg-card">
                <div className="avatar-water absolute inset-x-0 overflow-hidden bg-sky-500/80">
                    <div className="water-drift-slow avatar-water-slow absolute inset-0 opacity-95"/>
                    <div className="water-drift-medium avatar-water-medium absolute inset-0 opacity-75"/>
                    <div className="water-drift-fast avatar-water-fast absolute inset-0 opacity-60"/>
                    <div className="water-drift-speckles avatar-water-speckles absolute inset-0 opacity-65"/>
                </div>
                <div className="relative z-10 w-full h-full">
                    <Avatar triggerRef={triggerRef}/>
                </div>
            </div>
            <div
                className="avatar-theme-overlay"
                onClick={() => triggerRef.current?.()}
                aria-hidden="true"
            >
                <div className="avatar-theme-overlay-image"/>
            </div>
            <div
                className="top-creature-layer pointer-events-none absolute inset-[6.5%] z-[80] rounded-full"
                style={{animation: "spin 20s linear infinite reverse"}}
            >
                <PixelCreature className="pixel-creature pixel-creature-primary absolute bottom-0 left-1/2 z-[90] -translate-x-1/2 translate-y-1/2"/>
            </div>
        </div>
    );
}
export function Avatar({
                           triggerRef,
                       }: {
    triggerRef?: { current: (() => void) | null };
}) {
    const frameDuration = 200;

    const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
    const [src, setSrc] = useState(() => duckFrames[getStoredTheme()].idle);

    const quackRef = useRef<HTMLAudioElement | null>(null);
    const timeoutRefs = useRef<number[]>([]);

    const frames = duckFrames[theme];

    useEffect(() => {
        Object.values(duckFrames).forEach((themeFrames) => {
            Object.values(themeFrames).forEach((frameSrc) => {
                const image = new Image();
                image.src = frameSrc;
            });
        });

        quackRef.current = new Audio(quackSfx);
        quackRef.current.preload = "auto";

        return () => {
            timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
            quackRef.current = null;
        };
    }, []);

    useEffect(() => {
        function handleThemeChange(event: Event) {
            const nextTheme = (event as CustomEvent<ThemeMode>).detail;

            if (!isThemeMode(nextTheme)) return;

            setTheme(nextTheme);
            setSrc(duckFrames[nextTheme].idle);
        }

        function handleStorageChange(event: StorageEvent) {
            if (event.key !== "theme") return;
            if (!isThemeMode(event.newValue)) return;

            setTheme(event.newValue);
            setSrc(duckFrames[event.newValue].idle);
        }

        window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    function clearAnimationTimers() {
        timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
        timeoutRefs.current = [];
    }

    function trigger() {
        clearAnimationTimers();

        const currentFrames = duckFrames[theme];

        const quack = quackRef.current;
        if (quack) {
            try {
                quack.currentTime = 0;
                void quack.play().catch(() => {});
            } catch {
                // Ignore audio state errors; the visual animation should still run.
            }
        }

        setSrc(currentFrames.clicked1);

        const firstTimeout = window.setTimeout(() => {
            setSrc(currentFrames.clicked2);

            const secondTimeout = window.setTimeout(() => {
                setSrc(currentFrames.idle);
            }, frameDuration);

            timeoutRefs.current.push(secondTimeout);
        }, frameDuration);

        timeoutRefs.current.push(firstTimeout);
    }

    useEffect(() => {
        if (!triggerRef) return;

        triggerRef.current = trigger;

        return () => {
            triggerRef.current = null;
        };
    }, [triggerRef, theme]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <span className="duck-float inline-flex translate-y-3">
                <img
                    src={src}
                    alt="Rubber duck"
                    draggable="false"
                    className="object-contain select-none"
                    style={{width: "var(--duck-size)", height: "var(--duck-size)", imageRendering: "pixelated"}}
                    onPointerDown={(e) => {
                        e.currentTarget.style.transform = "translateY(2px)";
                    }}
                    onPointerUp={(e) => {
                        e.currentTarget.style.transform = "";
                    }}
                    onPointerCancel={(e) => {
                        e.currentTarget.style.transform = "";
                    }}
                    onPointerLeave={(e) => {
                        e.currentTarget.style.transform = "";
                    }}
                />
            </span>
        </div>
    );
}


