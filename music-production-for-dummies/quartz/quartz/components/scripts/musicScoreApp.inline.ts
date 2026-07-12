type MusicConfiguration = {
    preset: "untimed" | "timed" | "free"
    mode: "timed" | "untimed"
    bpm: number
    quantize: "1/4" | "1/8" | "1/16" | "1/32"
    octave: number
    key: string
    scale: string
    clef: "treble" | "bass"
    "time-signature": string
    notes: string
}

function parseMusicConfiguration(source: string): MusicConfiguration {
    const values = new Map<string, string>()
    for (const line of source.split(/\r?\n/)) {
        const match = line.trim().match(/^([a-z-]+)\s*:\s*(.+)$/i)
        if (match) values.set(match[1].toLowerCase(), match[2].trim())
    }

    const requestedMode = (values.get("mode") || "untimed").toLowerCase()
    const requestedPreset = (values.get("preset") || "free").toLowerCase()
    const requestedBpm = Number(values.get("bpm") || 120)
    const requestedQuantize = values.get("quantize") || "1/16"
    const requestedOctave = Number(values.get("octave") || 4)

    return {
        preset: (["untimed", "timed", "free"].includes(requestedPreset)
            ? requestedPreset
            : "free") as MusicConfiguration["preset"],
        mode: requestedMode === "timed" ? "timed" : "untimed",
        bpm: Math.min(300, Math.max(20, Number.isFinite(requestedBpm) ? requestedBpm : 120)),
        quantize: (["1/4", "1/8", "1/16", "1/32"].includes(requestedQuantize)
            ? requestedQuantize
            : "1/16") as MusicConfiguration["quantize"],
        octave: Math.min(7, Math.max(1, Number.isFinite(requestedOctave) ? requestedOctave : 4)),
        key: values.get("key") || "C",
        scale: values.get("scale") || "major",
        clef: values.get("clef") === "bass" ? "bass" : "treble",
        "time-signature": values.get("time-signature") || "4/4",
        notes: values.get("notes") || "",
    }
}

function currentMusicScoreTheme(): "light" | "dark" {
    const saved = document.documentElement.getAttribute("saved-theme")
    if (saved === "dark" || saved === "light") return saved
    return document.documentElement.classList.contains("dark") || document.body.classList.contains("theme-dark")
        ? "dark"
        : "light"
}

function musicScoreAssetUrl(config: MusicConfiguration): string {
    // const baseUrl = window.location.origin + "/music-production-for-dummies";
    const url = new URL("../../../static/music-score-app/index.html", window.location.origin);

    for (const [name, value] of Object.entries(config)) {
        url.searchParams.set(name, String(value));
    }
    url.searchParams.set("theme", currentMusicScoreTheme());
    return url.href;
}

function buildMusicScoreFrame(source: string): HTMLElement {
    const config = parseMusicConfiguration(source)
    const wrapper = document.createElement("div")
    wrapper.className = "music-score-frame-wrap"

    const frame = document.createElement("iframe")
    frame.className = "music-score-frame"
    frame.title = "Interactive music score and piano"
    frame.loading = "lazy"
    frame.allow = "autoplay"
    frame.src = musicScoreAssetUrl(config)
    wrapper.append(frame)
    return wrapper
}

function setupMusicScoreApps() {
    const allPres = document.querySelectorAll('pre');

    allPres.forEach(pre => {
        if (pre.dataset.musicScoreMounted === "true") return;

        const content = pre.innerText;

        if (content.includes("preset:") && content.includes("notes:")) {
            console.log("MusicScore: Found match in pre tag, mounting...");

            pre.dataset.musicScoreMounted = "true";
            const wrapper = buildMusicScoreFrame(content);
            pre.replaceWith(wrapper);
        }
    });

    document.querySelectorAll('.callout[data-callout="music-score"]').forEach(callout => {
        if ((callout as HTMLElement).dataset.musicScoreMounted === "true") return;
        const content = callout.querySelector(".callout-content");
        if (content) {
            content.replaceChildren(buildMusicScoreFrame((content as HTMLElement).innerText));
            (callout as HTMLElement).dataset.musicScoreMounted = "true";
        }
    });
}

const runSetup = () => {
    console.log("MusicScore: Running setup...");
    setupMusicScoreApps();
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", runSetup);
} else {
    runSetup();
}

document.addEventListener("nav", () => setTimeout(runSetup, 100));
document.addEventListener("render", runSetup);

document.addEventListener("themechange", (event) => {
    const theme = (event as any).detail?.theme;
    document.querySelectorAll<HTMLIFrameElement>(".music-score-frame").forEach((frame) => {
        if (frame.contentWindow) {
            frame.contentWindow.postMessage({ type: "music-score-theme", theme }, "*");
        }
    });
});

window.addEventListener("message", (event) => {
    if (event.data?.type === "resize") {
        const frames = document.querySelectorAll<HTMLIFrameElement>(".music-score-frame");
        frames.forEach(frame => {
            if (frame.contentWindow === event.source) {
                frame.style.height = event.data.height + "px";
            }
        });
    }
});
