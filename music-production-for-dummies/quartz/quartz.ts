import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import MusicScoreAppLoader from "./quartz/components/MusicScoreAppLoader"

const config = await loadQuartzConfig()
export default config

const baseLayout = await loadQuartzLayout()
const addMusicScoreLoader = (pageLayout: (typeof baseLayout)["defaults"]) => ({
  ...pageLayout,
  afterBody: [...(pageLayout.afterBody ?? []), MusicScoreAppLoader()],
})

export const layout = {
  defaults: addMusicScoreLoader(baseLayout.defaults),
  byPageType: Object.fromEntries(
    Object.entries(baseLayout.byPageType).map(([pageType, pageLayout]) => [
      pageType,
      addMusicScoreLoader(pageLayout),
    ]),
  ),
}
