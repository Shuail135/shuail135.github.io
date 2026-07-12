import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import MusicScoreAppLoader from "./quartz/components/MusicScoreAppLoader"
import { MusicScoreTransformer } from "./quartz/plugins/transformers/musicScore"

// --- 1. CONFIGURATION OVERRIDE ---
const config = await loadQuartzConfig()

// Safely inject the Transformer plugin into the configuration
if (config.plugins.transformers) {
  // Unshift puts our transformer at the very beginning so it parses the 
  // music-score block BEFORE standard syntax highlighting converts it to text
  config.plugins.transformers.unshift(MusicScoreTransformer())
}

export default config


// --- 2. LAYOUT OVERRIDE ---
const baseLayout = await loadQuartzLayout()

// Helper function to inject the AppLoader component
const addMusicScoreLoader = (pageLayout: (typeof baseLayout)["defaults"]) => ({
  ...pageLayout,
  afterBody: [...(pageLayout.afterBody ?? []), MusicScoreAppLoader()],
})

// Export the customized layout
export const layout = {
  defaults: addMusicScoreLoader(baseLayout.defaults),
  byPageType: Object.fromEntries(
    Object.entries(baseLayout.byPageType).map(([pageType, pageLayout]) => [
      pageType,
      addMusicScoreLoader(pageLayout),
    ]),
  ),
}