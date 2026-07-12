import {QuartzTransformerPlugin} from "../types"
import {visit} from "unist-util-visit"
import {Element} from "hast" // Quartz v5 uses hast (HTML AST)


export const MusicScoreTransformer: QuartzTransformerPlugin = () => {
    return {
        name: "MusicScoreTransformer",
        htmlPlugins() {
            return [
                () => (tree) => {
                    visit(tree, "element", (node: Element) => {
                        if (node.tagName === "pre") {
                            const codeNode = node.children.find((c): c is Element => c.type === "element" && c.tagName === "code")
                            if (codeNode?.properties?.className) {
                                const classes = codeNode.properties.className;
                                const isMusicScore = Array.isArray(classes) && classes.includes("language-music-score");
                                if (isMusicScore) {
                                    const textNode = codeNode.children[0] as any
                                    const textContent = textNode.value || ""

                                    // Keep the raw text available for your script to read
                                    node.tagName = "div"
                                    node.properties = {className: ["music-score-container"]}
                                    node.children = [{
                                        type: "element",
                                        tagName: "pre",
                                        properties: {className: ["music-score-source"], style: "display:none"},
                                        children: [{type: "text", value: textContent}]
                                    }]
                                }
                            }
                        }
                    })
                },
            ]
        },
    }
}