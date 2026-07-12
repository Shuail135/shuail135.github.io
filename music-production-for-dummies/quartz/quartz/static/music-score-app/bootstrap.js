const app = document.querySelector("#music-app")
const params = new URLSearchParams(location.search)

function applyConfiguration(values) {
  for (const [name, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) app.setAttribute(name, String(value))
  }
}

applyConfiguration(Object.fromEntries(params.entries()))

try {
  const context = JSON.parse(window.name || "{}")
  if (context && typeof context === "object" && !Array.isArray(context)) applyConfiguration(context)
} catch {
  // An iframe can be opened outside Quartz without serialized configuration.
}

app.setAttribute("engine-url", "./music_engine.wasm")
await import("./music-score-app.js")

let resizeFrame = 0
function sendHeight() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
    )
    window.parent.postMessage({ type: "resize", height }, window.location.origin)
  })
}

window.addEventListener("load", sendHeight)
new MutationObserver(sendHeight).observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
})
new ResizeObserver(sendHeight).observe(document.body)
window.addEventListener("resize", sendHeight)
sendHeight()
