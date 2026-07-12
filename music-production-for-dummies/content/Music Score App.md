---
title: Music Score App
---

# Music Score App

## 1. Fixed no-timing mode

Recording mode, quantization, and time signature are hidden. Every entered note or rest is a quarter note, while playback speed remains adjustable.


```music-score
preset: untimed 
bpm: 100 
key: C 
scale: major
clef: treble
octave: 4
notes: C4/1 D4/1 E4/1 R/1 G4/1
```

## 2. Fixed timed-recording mode

The recording-mode selector is hidden. BPM, quantization, and time signature remain available.

> [!music-score] Timed recorder
> preset: timed
> bpm: 120
> quantize: 1/16
> time-signature: 4/4
> key: D
> scale: dorian
> clef: treble
> octave: 4
> notes: D4@0/1 F4@1/1 G4@2/0.5 R@2.5/0.5 A4@3/1

## 3. Free mode

The recording-mode selector is visible, so it can switch between timed and untimed recording.

```music-score
preset: free
mode: timed
bpm: 90
quantize: 1/8
time-signature: 6/8
key: E
scale: phrygian
clef: bass
octave: 3
notes: E3@0/0.5 F3@0.5/0.5 G3@1/1 R@2/0.5 B3@2.5/0.5
```

Click the clef symbol to switch between treble and bass. Click the time signature to change it. Use **Staff entry** to switch between notes and rests, and use **Download MIDI** to export the score.
