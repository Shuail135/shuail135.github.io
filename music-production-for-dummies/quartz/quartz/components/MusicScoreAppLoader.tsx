import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore - Quartz bundles .inline.ts files as raw browser scripts.
import script from "./scripts/musicScoreApp.inline"

export default (() => {
  const MusicScoreAppLoader: QuartzComponent = () => (
    <span class="music-score-app-loader" aria-hidden="true" />
  )

  MusicScoreAppLoader.afterDOMLoaded = script
  MusicScoreAppLoader.css = `
    .music-score-app-loader { display: none; }

    .music-score-frame-wrap {
      width: 100%;
      margin: 0.75rem 0;
      overflow: hidden;
    }

    .music-score-frame {
      display: block;
      width: 100%;
      height: 1px;
      border: 0;
      background: transparent;
    }

    .music-score-frame:focus,
    .music-score-frame:focus-visible {
      outline: none;
      box-shadow: none;
    }

    .callout[data-callout="music-score"] .callout-content {
      overflow: visible;
    }

  `

  return MusicScoreAppLoader
}) satisfies QuartzComponentConstructor
