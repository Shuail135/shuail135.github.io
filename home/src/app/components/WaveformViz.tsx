export function WaveformViz({className = ""}: { className?: string }) {
    const heights = [
        18, 32, 52, 68, 44, 78, 58, 38, 72, 88, 62, 48, 82, 68, 42, 28, 58, 72,
        52, 38, 78, 62, 88, 68, 48, 34, 62, 78, 52, 38, 68, 82, 58, 42, 72, 52,
        38, 62, 78, 48, 32, 68, 82, 56, 42, 28, 52, 68, 42, 22,
    ];

    return (
        <svg viewBox="0 0 402 100" className={className} preserveAspectRatio="none">
            <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35"/>
                    <stop offset="35%" stopColor="var(--accent)" stopOpacity="0.9"/>
                    <stop offset="65%" stopColor="var(--primary)" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35"/>
                </linearGradient>
            </defs>
            {heights.map((h, i) => (
                <rect
                    key={i}
                    x={i * 8 + 2}
                    y={(100 - h) / 2}
                    width="5"
                    height={h}
                    rx="2.5"
                    fill="url(#waveGrad)"
                />
            ))}
        </svg>
    );
}
