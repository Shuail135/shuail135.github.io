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
                    className="w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] object-contain select-none"
                    style={{imageRendering: "pixelated"}}
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