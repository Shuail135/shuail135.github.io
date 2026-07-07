import {PiSunglassesDuotone} from "react-icons/pi";
import {TbPlanet} from "react-icons/tb";
import type {ThemeMode} from "../types";

export function ThemeToggle({
                                theme,
                                onToggle,
                            }: {
    theme: ThemeMode;
    onToggle: () => void;
}) {
    const isLight = theme === "light";

    return (
        <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10"
            aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
            title={`Switch to ${isLight ? "dark" : "light"} theme`}
        >
            {isLight ? <TbPlanet size={18}/> : <PiSunglassesDuotone size={18}/>}
        </button>
    );
}
