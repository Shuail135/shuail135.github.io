import { QuartzComponent, QuartzComponentConstructor } from "./types"
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
      border-radius: 16px;
	  min-height: 760px
    }

    .music-score-frame {
      display: block;
      width: 100%;
      height: 760px;
      border: 0;
      background: transparent;
    }

    .callout[data-callout="music-score"] .callout-content {
      overflow: visible;
    }

    @media (max-width: 620px) {
      .music-score-frame { height: 860px; }
    }
  `

  return MusicScoreAppLoader
}) satisfies QuartzComponentConstructor
