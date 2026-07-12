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
    // Directly point to the static folder where we just moved the WebAssembly app
    const url = new URL("static/music-score-app/index.html", window.location.origin)

    // Append all our configuration parameters to the URL
    for (const [name, value] of Object.entries(config)) {
        url.searchParams.set(name, String(value))
    }

    url.searchParams.set("theme", currentMusicScoreTheme())
    return url.href
}

function buildMusicScoreFrame(source: string): HTMLElement {
    const config = parseMusicConfiguration(source)
    const wrapper = document.createElement("div")
    wrapper.className = "music-score-frame-wrap"

    const frame = document.createElement("iframe")
    frame.className = "music-score-frame"
    frame.title = "Interactive music score"
    // Add these security and interaction attributes to keep the frame "alive"
    frame.setAttribute("allow", "autoplay; fullscreen; camera; microphone")
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms")

    frame.src = musicScoreAssetUrl(config)
    wrapper.append(frame)
    return wrapper
}

function setupMusicScoreApps() {
    for (const callout of document.querySelectorAll<HTMLElement>(
        '.callout[data-callout="music-score"]',
    )) {
        if (callout.dataset.musicScoreMounted === "true") continue
        const content = callout.querySelector<HTMLElement>(".callout-content")
        if (!content) continue
        const source = content.innerText
        content.replaceChildren(buildMusicScoreFrame(source))
        callout.dataset.musicScoreMounted = "true"
    }

    for (const container of document.querySelectorAll<HTMLElement>('.music-score-container')) {
        if (container.dataset.musicScoreMounted === "true") continue

        const sourceEl = container.querySelector(".music-score-source")
        const source = sourceEl?.textContent || ""

        container.replaceChildren(buildMusicScoreFrame(source))
        container.dataset.musicScoreMounted = "true"
    }
}

setupMusicScoreApps()
document.addEventListener("nav", setupMusicScoreApps)
document.addEventListener("render", setupMusicScoreApps)
document.addEventListener("themechange", (event) => {
    const theme = event.detail.theme
    for (const frame of document.querySelectorAll<HTMLIFrameElement>(".music-score-frame")) {
        frame.contentWindow?.postMessage({type: "music-score-theme", theme}, location.origin)
    }
})
