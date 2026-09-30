import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight, SlidersHorizontal} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import equalizer from "../../assets/camitune/equalizer.png";
import simpleEq from "../../assets/camitune/simple-eq.png";
import spectrum from "../../assets/camitune/live-spectrum.png";
import appAudio from "../../assets/camitune/app-audio.png";
import menuBar from "../../assets/camitune/menu-bar.png";
import autoEq from "../../assets/camitune/device-correction.png";
import crossfeed from "../../assets/camitune/crossfeed.png";
import fir from "../../assets/camitune/fir.png";
import profiles from "../../assets/camitune/output-profiles.png";
import channels from "../../assets/camitune/channel-processing.png";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "./ui/dialog";

type Screenshot = {
    title: string;
    description: string;
    src: string;
    width: number;
    height: number;
    displayWidth?: number;

};

type ScreenshotGroup = {id: string; label: string; screenshots: Screenshot[]};

const GROUPS: ScreenshotGroup[] = [
    {
        id: "profiles", label: "Output profiles", screenshots: [
            {title: "Output profiles", description: "Store the output device, sample rate, EQ, device correction, FIR and channel settings per profile. Activate a profile manually, when its physical device is in use, or when its profile device is selected.", src: profiles, width: 2174, height: 760},
        ],
    },
    {
        id: "spectrum", label: "Live spectrum", screenshots: [
            {title: "Live spectrum", description: "Compare audio before and after EQ with live spectrum monitoring and an EQ response overlay.", src: spectrum, width: 2152, height: 628},
        ],
    },
    {
        id: "app-audio", label: "Per-app audio", screenshots: [
            {title: "App audio controls", description: "Independent volume, mute and EQ for each app, accessible from the menu bar.", src: appAudio, width: 724, height: 578, displayWidth: 362},
            {title: "Menu-bar status", description: "The menu-bar icon indicates whether CamiTune is active.", src: menuBar, width: 188, height: 61, displayWidth: 188},
        ],
    },
    {
        id: "equalizer", label: "Equalizer", screenshots: [
            {title: "Parametric EQ", description: "Adjust frequency, gain, Q and filter type across up to 20 bands. Import Equalizer APO .txt presets and edit them visually.", src: equalizer, width: 2098, height: 1180},
            {title: "Simple EQ", description: "Bass, mids and treble controls for quick adjustments, alongside the parametric equalizer.", src: simpleEq, width: 684, height: 218, displayWidth: 560},
        ],
    },
    {
        id: "correction", label: "Device correction", screenshots: [
            {title: "Auto EQ", description: "Correction for headphones, IEMs and speakers. Fine-tune the result by dragging curves or entering values.", src: autoEq, width: 2410, height: 688},
            {title: "Headphone crossfeed", description: "Adjust crossfeed amount, delay and frequency for headphone listening.", src: crossfeed, width: 1706, height: 282},
            {title: "FIR convolution", description: "FIR processing with impulse-response support, saved with the output profile.", src: fir, width: 1708, height: 662},
        ],
    },
    {
        id: "channels", label: "Channel processing", screenshots: [
            {title: "Per-channel processing", description: "Configure processing for individual audio channels within an output profile.", src: channels, width: 2094, height: 1052},
        ],
    },
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function ScreenshotFigure({screenshot, active}: {screenshot: Screenshot; active: boolean}) {
    return (
        <figure className="camitune-screenshot min-w-0 overflow-hidden rounded-xl border border-border bg-card">
            <Dialog>
                <div className="camitune-screenshot-image p-3 sm:p-5">
                    <DialogTrigger asChild>
                        <button type="button" tabIndex={active ? 0 : -1} aria-label={`Enlarge ${screenshot.title} screenshot`} className={`group relative block mx-auto w-full cursor-grab active:cursor-grabbing rounded-lg ${focusRing}`} style={{maxWidth: screenshot.displayWidth ?? screenshot.width}}>
                            <img src={screenshot.src} alt={`${screenshot.title} in CamiTune`} width={screenshot.width} height={screenshot.height} loading="lazy" draggable={false} className="block w-full h-auto rounded-lg select-none"/>
                        </button>
                    </DialogTrigger>
                </div>
                <DialogContent className="camitune-image-dialog sm:max-w-[min(90vw,1400px)] max-h-[90dvh] overflow-y-auto bg-card text-foreground border-border">
                    <DialogTitle className="pr-8 font-display">{screenshot.title}</DialogTitle>
                    <DialogDescription>{screenshot.description}</DialogDescription>
                    <img src={screenshot.src} alt={`${screenshot.title} in CamiTune, enlarged`} width={screenshot.width} height={screenshot.height} className="mx-auto block max-w-full h-auto rounded-lg"/>
                    <a href={screenshot.src} target="_blank" rel="noopener noreferrer" className={`justify-self-start rounded text-sm underline underline-offset-4 ${focusRing}`}>Open original image</a>
                </DialogContent>
            </Dialog>
            <figcaption className="border-t border-border px-4 py-4 sm:px-5">
                <h4 className="font-display text-sm font-semibold">{screenshot.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{screenshot.description}</p>
            </figcaption>
        </figure>
    );
}

const SLIDES = GROUPS.flatMap((group) => group.screenshots.map((screenshot) => ({group, screenshot})));

export function CamiTuneGallery() {
    const [viewportRef, carousel] = useEmblaCarousel({align: "start", watchFocus: false});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [slideHeight, setSlideHeight] = useState<number>();
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const selectedGroup = SLIDES[selectedIndex].group;
    const featureNavRef = useRef<HTMLDivElement | null>(null);
    const featureButtons = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicator, setIndicator] = useState({left: 0, width: 0});

    useLayoutEffect(() => {
        const nav = featureNavRef.current;
        const button = featureButtons.current[GROUPS.findIndex((group) => group.id === selectedGroup.id)];
        if (!nav || !button) return;
        const updateNavigation = () => {
            const firstSlide = SLIDES.findIndex((slide) => slide.group.id === selectedGroup.id);
            const pageWidth = button.offsetWidth / selectedGroup.screenshots.length;
            setIndicator({
                left: button.offsetLeft + (selectedIndex - firstSlide) * pageWidth,
                width: pageWidth,
            });
            nav.scrollTo({
                left: button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
        };
        updateNavigation();
        const observer = new ResizeObserver(updateNavigation);
        observer.observe(nav);
        observer.observe(button);
        return () => observer.disconnect();
    }, [selectedGroup.id, selectedIndex]);

    useEffect(() => {
        if (!carousel) return;
        const syncSelection = () => setSelectedIndex(carousel.selectedScrollSnap());
        syncSelection();
        carousel.on("select", syncSelection);
        carousel.on("reInit", syncSelection);
        return () => {
            carousel.off("select", syncSelection);
            carousel.off("reInit", syncSelection);
        };
    }, [carousel]);

    useLayoutEffect(() => {
        const slide = slideRefs.current[selectedIndex];
        if (!slide) return;
        const updateHeight = () => setSlideHeight(slide.getBoundingClientRect().height);
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(slide);
        return () => observer.disconnect();
    }, [selectedIndex]);

    const goToSlide = (index: number) => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        carousel?.scrollTo(index, reducedMotion);
    };

    return (
        <div role="region" aria-roledescription="carousel" aria-label="CamiTune core features" className="camitune-preview w-full max-w-5xl min-w-0 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border">
                <h3 className="flex items-center gap-2 px-4 sm:px-6 pt-5 pb-3 font-display text-sm font-semibold"><SlidersHorizontal size={17} aria-hidden="true" className="text-accent"/>Core features</h3>
                <div ref={featureNavRef} role="group" aria-label="Core feature categories" className="camitune-feature-nav overflow-x-auto">
                    <div className="relative flex w-max min-w-full px-2 sm:px-3">
                        {GROUPS.map((group, index) => (
                            <button key={group.id} ref={(element) => {featureButtons.current[index] = element;}} type="button" aria-pressed={selectedGroup.id === group.id} aria-controls="camitune-screenshots" onClick={() => goToSlide(SLIDES.findIndex((slide) => slide.group.id === group.id))} className={`camitune-feature-label shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary ${selectedGroup.id === group.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                                {group.label}
                            </button>
                        ))}
                        <span aria-hidden="true" className="camitune-feature-indicator absolute bottom-0 left-0 h-0.5 rounded-full bg-primary" style={{width: indicator.width, transform: `translateX(${indicator.left}px)`}}/>
                    </div>
                </div>
            </div>
            <div id="camitune-screenshots" ref={viewportRef} tabIndex={0} aria-label="Screenshot viewer" className={`overflow-hidden touch-pan-y touch-pinch-zoom rounded ${focusRing}`} style={{height: slideHeight}} onKeyDown={(event) => {
                if (!event.currentTarget.contains(event.target as Node)) return;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    goToSlide(selectedIndex + (event.key === "ArrowLeft" ? -1 : 1));
                }
            }}>
                <div className="flex items-start">
                    {SLIDES.map(({screenshot}, index) => (
                        <div key={screenshot.title} ref={(element) => {slideRefs.current[index] = element;}} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${SLIDES.length}: ${screenshot.title}`} aria-hidden={index !== selectedIndex} className="min-w-0 flex-[0_0_100%] p-3 sm:p-6">
                            <ScreenshotFigure screenshot={screenshot} active={index === selectedIndex}/>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-3">
                <button type="button" aria-label="Previous screenshot" disabled={selectedIndex === 0} onClick={() => goToSlide(selectedIndex - 1)} className={`rounded-lg border border-border bg-muted p-2.5 text-foreground disabled:opacity-30 disabled:cursor-default hover:enabled:bg-primary/10 ${focusRing}`}>
                    <ChevronLeft size={18} aria-hidden="true"/>
                </button>
                <p aria-live="polite" aria-atomic="true" className="min-w-16 text-center text-xs font-mono text-muted-foreground">
                    <span className="sr-only">Screenshot </span>{selectedIndex + 1} / {SLIDES.length}
                </p>
                <button type="button" aria-label="Next screenshot" disabled={selectedIndex === SLIDES.length - 1} onClick={() => goToSlide(selectedIndex + 1)} className={`rounded-lg border border-border bg-muted p-2.5 text-foreground disabled:opacity-30 disabled:cursor-default hover:enabled:bg-primary/10 ${focusRing}`}>
                    <ChevronRight size={18} aria-hidden="true"/>
                </button>
            </div>
        </div>
    );
}
