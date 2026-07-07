import {useEffect, useRef, useState} from "react";
import idleDuck from "../../../img/rubber_duck_idle.png";
import clickedDuck1 from "../../../img/rubber_duck_clicked1.png";
import clickedDuck2 from "../../../img/rubber_duck_clicked2.png";
import quackSfx from "../../../sfx/quack.mp3";

export {idleDuck};

export function Avatar({
                               triggerRef,
                           }: {
    triggerRef?: { current: (() => void) | null };
}) {
    const frameDuration = 200;
    const [src, setSrc] = useState(idleDuck);
    const animatingRef = useRef(false);
    const quackRef = useRef<HTMLAudioElement | null>(null);
    const timeoutRefs = useRef<number[]>([]);

    useEffect(() => {
        [idleDuck, clickedDuck1, clickedDuck2].forEach((s) => {
            const im = new Image();
            im.src = s;
        });
        quackRef.current = new Audio(quackSfx);
        quackRef.current.preload = "auto";

        return () => {
            timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
            quackRef.current = null;
        };
    }, []);

    function clearAnimationTimers() {
        timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
        timeoutRefs.current = [];
    }

    function trigger() {
        clearAnimationTimers();

        const quack = quackRef.current;
        if (quack) {
            try {
                quack.currentTime = 0;
                void quack.play().catch(() => {});
            } catch {
                // Ignore audio state errors; the visual animation should still run.
            }
        }

        animatingRef.current = true;
        setSrc(clickedDuck1);

        const firstTimeout = window.setTimeout(() => {
            setSrc(clickedDuck2);
            const secondTimeout = window.setTimeout(() => {
                setSrc(idleDuck);
                animatingRef.current = false;
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
    });

    return (
        <div className="w-full h-full flex items-center justify-center">
            <span className="duck-float inline-flex translate-y-3">
                <img
                    src={src}
                    alt="Rubber duck"
                    draggable="false"
                    className="w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] object-contain select-none"
                    style={{imageRendering: "pixelated"}}
                    onPointerDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
                    onPointerUp={(e) => (e.currentTarget.style.transform = "")}
                    onPointerCancel={(e) => (e.currentTarget.style.transform = "")}
                    onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
                />
            </span>
        </div>
    );
}
