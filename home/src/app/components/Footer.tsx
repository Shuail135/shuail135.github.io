import {CONTENT} from "../content";

export function Footer({duckSrc}: { duckSrc: string }) {
    return (
        <footer className="footer-bottom-bar border-t border-border py-4">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="font-display font-semibold flex items-center gap-2">
                    <img
                        src={duckSrc}
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                        className="h-7 w-7 object-contain"
                        style={{imageRendering: "pixelated"}}
                    />
                    <span><span className="text-primary">{CONTENT.site.brandPrefix}</span>{CONTENT.site.owner}<span className="text-primary">{CONTENT.site.brandSuffix}</span></span>
                </div>
                <div className="font-mono text-xs">
                    {CONTENT.footer.note}
                </div>
            </div>
        </footer>
    );
}
