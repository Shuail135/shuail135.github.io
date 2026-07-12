import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/musicScoreApp.inline" 

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return (
    <>
      {/* This renders the script into the page */}
      <script dangerouslySetInnerHTML={{ __html: script }} />
      
      {children.length > 0 ? <header>{children}</header> : null}
    </>
  )
}

Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}

header h1 {
  margin: 0;
  flex: auto;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
