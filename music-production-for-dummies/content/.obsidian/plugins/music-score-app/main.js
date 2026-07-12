var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// integrations/obsidian/src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MusicScorePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// shared/engine.js
var VALID_GRIDS = /* @__PURE__ */ new Set([4, 8, 16, 32]);
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
var JavaScriptScoreEngine = class {
  constructor() {
    this.notes = [];
    this.active = /* @__PURE__ */ new Map();
    this.undoIds = [];
    this.nextId = 1;
    this.timed = false;
    this.recording = false;
    this.bpm = 120;
    this.denominator = 16;
    this.startedMs = 0;
    this.baseBeat = 0;
    this.kind = "JavaScript fallback";
  }
  get grid() {
    return 4 / this.denominator;
  }
  reset() {
    this.notes = [];
    this.active.clear();
    this.undoIds = [];
    this.nextId = 1;
    this.recording = false;
  }
  setMode(timed) {
    this.timed = Boolean(timed);
  }
  setBpm(value) {
    this.bpm = clamp(Number(value) || 120, 20, 300);
  }
  setGrid(denominator) {
    const parsed = Number(denominator);
    this.denominator = VALID_GRIDS.has(parsed) ? parsed : 16;
  }
  quantize(beat) {
    return Math.round(beat / this.grid) * this.grid;
  }
  endBeat() {
    return this.notes.reduce((end, note) => Math.max(end, note.start + note.duration), 0);
  }
  elapsedBeat(nowMs) {
    return this.baseBeat + Math.max(0, nowMs - this.startedMs) * this.bpm / 6e4;
  }
  add(midi, start, duration, velocity = 96) {
    if (this.notes.length >= 512 || midi < -1 || midi > 127) return;
    const note = {
      id: this.nextId++,
      midi,
      start: Math.max(0, start),
      duration: Math.max(this.grid, duration),
      velocity: clamp(velocity, 1, 127)
    };
    this.notes.push(note);
    this.undoIds.push(note.id);
    this.notes.sort((a, b) => a.start - b.start || a.midi - b.midi);
  }
  startRecording(nowMs) {
    this.recording = true;
    this.startedMs = nowMs;
    this.baseBeat = this.endBeat();
  }
  stopRecording(nowMs) {
    if (this.timed) {
      for (const midi of [...this.active.keys()]) this.noteOff(midi, nowMs);
    }
    this.recording = false;
  }
  noteOn(midi, nowMs, velocity = 96) {
    if (!this.recording) return;
    if (!this.timed) {
      this.add(midi, this.endBeat(), 1, velocity);
      return;
    }
    if (this.active.has(midi)) return;
    this.active.set(midi, {
      start: this.quantize(this.elapsedBeat(nowMs)),
      velocity
    });
  }
  noteOff(midi, nowMs) {
    if (!this.timed) return;
    const active = this.active.get(midi);
    if (!active) return;
    const end = this.quantize(this.elapsedBeat(nowMs));
    this.add(midi, active.start, Math.max(this.grid, end - active.start), active.velocity);
    this.active.delete(midi);
  }
  addNoteAt(midi, start, duration, velocity = 96) {
    if (this.timed) {
      this.add(midi, this.quantize(start), Math.max(this.grid, this.quantize(duration)), velocity);
    } else {
      this.add(midi, this.endBeat(), 1, velocity);
    }
  }
  undo() {
    const id = this.undoIds.pop();
    if (id == null) return;
    this.notes = this.notes.filter((note) => note.id !== id);
  }
  getNotes() {
    return this.notes.map((note) => ({ ...note }));
  }
};
function wasmFunction(exports, name) {
  const fn = exports[name] ?? exports[`_${name}`];
  if (typeof fn !== "function") throw new Error(`Missing WebAssembly export: ${name}`);
  return fn;
}
function wrapWasm(instance) {
  const exports = instance.exports;
  const call = (name) => wasmFunction(exports, name);
  const version = call("engine_version")();
  if (version !== 1) throw new Error(`Unsupported music engine version: ${version}`);
  return {
    kind: "C++ / WebAssembly",
    reset: () => call("engine_reset")(),
    setMode: (timed) => call("engine_set_mode")(timed ? 1 : 0),
    setBpm: (bpm) => call("engine_set_bpm")(bpm),
    setGrid: (denominator) => call("engine_set_grid")(denominator),
    startRecording: (nowMs) => call("engine_start_recording")(nowMs),
    stopRecording: (nowMs) => call("engine_stop_recording")(nowMs),
    noteOn: (midi, nowMs, velocity = 96) => call("engine_note_on")(midi, nowMs, velocity),
    noteOff: (midi, nowMs) => call("engine_note_off")(midi, nowMs),
    addNoteAt: (midi, start, duration, velocity = 96) => call("engine_add_note_at")(midi, start, duration, velocity),
    undo: () => call("engine_undo")(),
    endBeat: () => call("engine_end_beat")(),
    getNotes: () => {
      const count = call("engine_note_count")();
      const result = [];
      for (let index = 0; index < count; index += 1) {
        result.push({
          id: call("engine_note_id")(index),
          midi: call("engine_note_midi")(index),
          start: call("engine_note_start")(index),
          duration: call("engine_note_duration")(index),
          velocity: call("engine_note_velocity")(index)
        });
      }
      return result;
    }
  };
}
var wasiImports = {
  proc_exit() {
  },
  fd_close() {
    return 0;
  },
  fd_seek() {
    return 0;
  },
  fd_write() {
    return 0;
  },
  environ_get() {
    return 0;
  },
  environ_sizes_get() {
    return 0;
  }
};
async function createScoreEngine(wasmUrl) {
  if (wasmUrl) {
    try {
      const imports = { env: {}, wasi_snapshot_preview1: wasiImports };
      const response = await fetch(wasmUrl);
      if (!response.ok) throw new Error(`WebAssembly request returned ${response.status}`);
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, imports);
      return wrapWasm(instance);
    } catch (error) {
      console.info("Music Score App: using the JavaScript engine until music_engine.wasm is built.", error);
    }
  }
  return new JavaScriptScoreEngine();
}

// shared/midi.js
function variableLengthQuantity(value) {
  let buffer = value & 127;
  const bytes = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= value & 127 | 128;
  }
  while (true) {
    bytes.push(buffer & 255);
    if (buffer & 128) buffer >>= 8;
    else break;
  }
  return bytes;
}
function integer32(value) {
  return [value >>> 24 & 255, value >>> 16 & 255, value >>> 8 & 255, value & 255];
}
function createMidiFile(notes, options = {}) {
  const ticksPerBeat = 480;
  const bpm = Math.min(300, Math.max(20, Number(options.bpm) || 120));
  const signatureMatch = String(options.timeSignature || "4/4").match(/^(\d+)\/(4|8)$/);
  const numerator = Number(signatureMatch?.[1] || 4);
  const denominator = Number(signatureMatch?.[2] || 4);
  const microsecondsPerBeat = Math.round(6e7 / bpm);
  const keySignature = Math.min(7, Math.max(-7, Number(options.keySignature) || 0));
  const events = [
    { tick: 0, order: -4, bytes: [255, 81, 3, microsecondsPerBeat >>> 16 & 255, microsecondsPerBeat >>> 8 & 255, microsecondsPerBeat & 255] },
    { tick: 0, order: -3, bytes: [255, 88, 4, numerator, Math.log2(denominator), 24, 8] },
    { tick: 0, order: -2, bytes: [255, 89, 2, keySignature & 255, options.isMinor ? 1 : 0] }
  ];
  let endTick = 0;
  for (const note of notes) {
    const startTick = Math.max(0, Math.round(note.start * ticksPerBeat));
    const finishTick = Math.max(startTick + 1, Math.round((note.start + note.duration) * ticksPerBeat));
    endTick = Math.max(endTick, finishTick);
    if (note.midi < 0) continue;
    events.push({ tick: startTick, order: 1, bytes: [144, note.midi, note.velocity] });
    events.push({ tick: finishTick, order: 0, bytes: [128, note.midi, 0] });
  }
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const track = [];
  let previousTick = 0;
  for (const event of events) {
    track.push(...variableLengthQuantity(event.tick - previousTick), ...event.bytes);
    previousTick = event.tick;
  }
  track.push(...variableLengthQuantity(Math.max(0, endTick - previousTick)), 255, 47, 0);
  return new Uint8Array([
    77,
    84,
    104,
    100,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    ticksPerBeat >>> 8 & 255,
    ticksPerBeat & 255,
    77,
    84,
    114,
    107,
    ...integer32(track.length),
    ...track
  ]);
}

// shared/music-score-app.js
var SVG_NS = "http://www.w3.org/2000/svg";
var BEAT_WIDTH = 54;
var STAFF_BOTTOM_Y = 102;
var STAFF_HALF_STEP = 6;
var E4_DIATONIC = 30;
var NATURAL_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];
var PITCH_INFO = [
  [0, false],
  [0, true],
  [1, false],
  [1, true],
  [2, false],
  [3, false],
  [3, true],
  [4, false],
  [4, true],
  [5, false],
  [5, true],
  [6, false]
];
var NOTE_NAMES = ["C", "C\u266F", "D", "D\u266F", "E", "F", "F\u266F", "G", "G\u266F", "A", "A\u266F", "B"];
var COMPUTER_KEYS = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k"];
var KEY_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var DEFAULT_PIANO_SAMPLE_URL = "https://tonejs.github.io/audio/salamander/";
var PIANO_SAMPLES = /* @__PURE__ */ new Map([
  [21, "A0.mp3"],
  [24, "C1.mp3"],
  [27, "Ds1.mp3"],
  [30, "Fs1.mp3"],
  [33, "A1.mp3"],
  [36, "C2.mp3"],
  [39, "Ds2.mp3"],
  [42, "Fs2.mp3"],
  [45, "A2.mp3"],
  [48, "C3.mp3"],
  [51, "Ds3.mp3"],
  [54, "Fs3.mp3"],
  [57, "A3.mp3"],
  [60, "C4.mp3"],
  [63, "Ds4.mp3"],
  [66, "Fs4.mp3"],
  [69, "A4.mp3"],
  [72, "C5.mp3"],
  [75, "Ds5.mp3"],
  [78, "Fs5.mp3"],
  [81, "A5.mp3"],
  [84, "C6.mp3"],
  [87, "Ds6.mp3"],
  [90, "Fs6.mp3"],
  [93, "A6.mp3"],
  [96, "C7.mp3"],
  [99, "Ds7.mp3"],
  [102, "Fs7.mp3"],
  [105, "A7.mp3"],
  [108, "C8.mp3"]
]);
var PIANO_SAMPLE_MIDI = [...PIANO_SAMPLES.keys()];
var SCALE_MODES = {
  major: { label: "Major", intervals: [0, 2, 4, 5, 7, 9, 11], relativeMajorOffset: 0 },
  minor: { label: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10], relativeMajorOffset: -9 },
  dorian: { label: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], relativeMajorOffset: -2 },
  mixolydian: { label: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10], relativeMajorOffset: -7 },
  lydian: { label: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11], relativeMajorOffset: -5 },
  phrygian: { label: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10], relativeMajorOffset: -4 },
  locrian: { label: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10], relativeMajorOffset: -11 }
};
var KEY_OPTIONS = [
  [0, "C"],
  [1, "C\u266F / D\u266D"],
  [2, "D"],
  [3, "E\u266D"],
  [4, "E"],
  [5, "F"],
  [6, "F\u266F / G\u266D"],
  [7, "G"],
  [8, "A\u266D"],
  [9, "A"],
  [10, "B\u266D"],
  [11, "B"]
];
var MAJOR_KEY_SIGNATURES = /* @__PURE__ */ new Map([
  [0, 0],
  [1, -5],
  [2, 2],
  [3, -3],
  [4, 4],
  [5, -1],
  [6, 6],
  [7, 1],
  [8, -4],
  [9, 3],
  [10, -2],
  [11, 5]
]);
var TIME_SIGNATURES = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8"];
var SHARP_DIATONIC = {
  treble: [38, 35, 39, 36, 33, 37, 34],
  bass: [24, 21, 25, 22, 19, 23, 20]
};
var FLAT_DIATONIC = {
  treble: [34, 37, 33, 36, 32, 35, 31],
  bass: [20, 23, 19, 22, 18, 21, 17]
};
var sharedAudioContext = null;
var sharedPianoSamplers = /* @__PURE__ */ new Map();
var AcousticPianoSampler = class {
  constructor(context, baseUrl) {
    this.context = context;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    this.buffers = /* @__PURE__ */ new Map();
    this.loading = /* @__PURE__ */ new Map();
  }
  nearestSampleMidi(midi) {
    return PIANO_SAMPLE_MIDI.reduce(
      (nearest, candidate) => Math.abs(candidate - midi) < Math.abs(nearest - midi) ? candidate : nearest,
      PIANO_SAMPLE_MIDI[0]
    );
  }
  async loadSample(sampleMidi) {
    if (this.buffers.has(sampleMidi)) return this.buffers.get(sampleMidi);
    if (this.loading.has(sampleMidi)) return this.loading.get(sampleMidi);
    const filename = PIANO_SAMPLES.get(sampleMidi);
    if (!filename) throw new Error(`No acoustic-piano sample for MIDI ${sampleMidi}`);
    const request = (async () => {
      const response = await fetch(new URL(filename, this.baseUrl));
      if (!response.ok) throw new Error(`Piano sample request returned ${response.status}`);
      const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
      this.buffers.set(sampleMidi, buffer);
      this.loading.delete(sampleMidi);
      return buffer;
    })().catch((error) => {
      this.loading.delete(sampleMidi);
      throw error;
    });
    this.loading.set(sampleMidi, request);
    return request;
  }
  async preload(midiNotes) {
    const samples = [...new Set(midiNotes.map((midi) => this.nearestSampleMidi(midi)))];
    await Promise.all(samples.map((sampleMidi) => this.loadSample(sampleMidi)));
  }
  createVoice(midi, startTime, duration, volume) {
    const sampleMidi = this.nearestSampleMidi(midi);
    const buffer = this.buffers.get(sampleMidi);
    if (!buffer) return null;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const level = Math.max(0.025, Math.min(0.9, volume * 0.82));
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(2 ** ((midi - sampleMidi) / 12), startTime);
    gain.gain.setValueAtTime(1e-4, startTime);
    gain.gain.exponentialRampToValueAtTime(level, startTime + 8e-3);
    source.connect(gain).connect(this.context.destination);
    source.start(startTime);
    const voice = { sources: [source], gain, released: false, acoustic: true };
    if (duration != null) {
      const releaseAt = startTime + Math.max(0.04, duration);
      gain.gain.setValueAtTime(level, releaseAt);
      gain.gain.exponentialRampToValueAtTime(1e-4, releaseAt + 0.32);
      source.stop(releaseAt + 0.36);
      voice.released = true;
    }
    return voice;
  }
};
var styles = `
  :host {
    display: block;
    color: #1b1b25;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --accent: #7257d5;
    --accent-soft: #eeeafd;
    --line: #d9d6e4;
    --panel: #ffffff;
    --muted: #686579;
    --staff-ink: #24222c;
    --key-white-top: #ffffff;
    --key-white-bottom: #e6e3eb;
    --key-black-a: #18171d;
    --key-black-b: #3b3944;
    --key-black-c: #111015;
    color-scheme: light;
  }

  :host([theme="dark"]) {
    color: #f0eff8;
    --accent: #a894ff;
    --accent-soft: #312a4d;
    --line: #4b475b;
    --panel: #211f2a;
    --muted: #b2adbf;
    --staff-ink: #f2eff8;
    --key-white-top: #f7f5fb;
    --key-white-bottom: #c9c5d2;
    --key-black-a: #09090d;
    --key-black-b: #34313d;
    --key-black-c: #050507;
    color-scheme: dark;
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) {
      color: #f0eff8;
      --accent: #a894ff;
      --accent-soft: #312a4d;
      --line: #4b475b;
      --panel: #211f2a;
      --muted: #b2adbf;
      --staff-ink: #f2eff8;
      --key-white-top: #f7f5fb;
      --key-white-bottom: #c9c5d2;
      --key-black-a: #09090d;
      --key-black-b: #34313d;
      --key-black-c: #050507;
      color-scheme: dark;
    }
  }

  * { box-sizing: border-box; }

  .app {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: color-mix(in srgb, var(--panel) 86%, var(--accent-soft));
    box-shadow: 0 10px 30px rgba(36, 28, 65, 0.08);
    outline: none;
  }

  .app:focus-visible { box-shadow: 0 0 0 3px rgba(114, 87, 213, 0.25); }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 9px;
    margin-bottom: 12px;
  }

  label {
    display: grid;
    gap: 4px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  select, input, button {
    min-height: 36px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--panel);
    color: inherit;
    font: inherit;
  }

  select, input { padding: 7px 10px; }
  input { width: 76px; }

  button {
    padding: 7px 12px;
    cursor: pointer;
    font-weight: 700;
  }

  button:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-soft); }
  button:disabled, select:disabled, input:disabled { cursor: not-allowed; opacity: 0.48; }
  button.primary { border-color: var(--accent); background: var(--accent); color: white; }
  button.recording { border-color: #c52f48; background: #c52f48; color: white; }
  .spacer { flex: 1 1 12px; }
  .hidden { display: none !important; }

  .staff-shell {
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    min-height: 178px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--panel);
    scrollbar-width: thin;
  }

  .staff-help {
    position: sticky;
    left: 10px;
    z-index: 2;
    display: inline-block;
    margin: 8px 0 -26px 10px;
    padding: 3px 7px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--panel) 90%, transparent);
    color: var(--muted);
    font-size: 11px;
    pointer-events: none;
  }

  svg.staff { display: block; height: 176px; cursor: crosshair; user-select: none; }
  .staff-line, .ledger, .bar-line, .beat-guide, .subdivision-guide, .stem, .flag { stroke: var(--staff-ink); stroke-linecap: round; }
  .staff-line { stroke-width: 1.2; }
  .bar-line { stroke-width: 1.2; opacity: 0.72; }
  .beat-guide { stroke-width: 0.7; opacity: 0.12; stroke-dasharray: 2 4; }
  .subdivision-guide { stroke-width: 0.7; opacity: 0.18; }
  .ledger { stroke-width: 1.3; }
  .note-head { fill: var(--staff-ink); stroke: var(--staff-ink); stroke-width: 1.3; }
  .note-head.hollow { fill: var(--panel); }
  .msa-note { cursor: pointer; }
  .msa-note:hover .note-head, .msa-note.playing .note-head { fill: var(--accent); stroke: var(--accent); }
  .msa-note.playing .stem, .msa-note.playing .flag { stroke: var(--accent); }
  .msa-note:hover .rest-symbol, .msa-note.playing .rest-symbol { fill: var(--accent); stroke: var(--accent); }
  .accidental, .key-signature { fill: var(--staff-ink); font-family: Georgia, serif; font-size: 21px; }
  .clef { fill: var(--staff-ink); font-family: Georgia, "Times New Roman", serif; font-size: 62px; cursor: pointer; }
  .time-signature { fill: var(--staff-ink); font-family: Georgia, serif; font-size: 23px; font-weight: 700; cursor: pointer; }
  .rest-symbol { fill: var(--staff-ink); stroke: var(--staff-ink); }

  .octave-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 13px 0 8px;
  }

  .octave-row button { min-width: 40px; padding-inline: 8px; }
  .octave-label { min-width: 92px; text-align: center; font-weight: 800; }

  .keyboard {
    position: relative;
    display: grid;
    grid-template-columns: repeat(8, minmax(34px, 1fr));
    height: 184px;
    max-width: 760px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid #a7a4af;
    border-radius: 10px;
    background: #202027;
    touch-action: none;
  }

  .piano-key {
    position: relative;
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    user-select: none;
    -webkit-user-select: none;
  }

  .piano-key.white {
    z-index: 1;
    grid-row: 1;
    border-right: 1px solid #aaa7b1;
    background: linear-gradient(var(--key-white-top) 0%, #ece9f1 72%, var(--key-white-bottom) 100%);
    color: #191820;
  }

  .piano-key.white:last-of-type { border-right: 0; }
  .piano-key.black {
    position: absolute;
    top: 0;
    z-index: 3;
    width: 7.5%;
    height: 61%;
    border: 1px solid #08080a;
    border-radius: 0 0 6px 6px;
    background: linear-gradient(90deg, var(--key-black-a), var(--key-black-b) 58%, var(--key-black-c));
    color: white;
  }

  .piano-key.white.active { background: linear-gradient(#ddd5ff, #bfb0f7); }
  .piano-key.black.active { background: linear-gradient(90deg, #4f3e91, #8069d8 58%, #382b70); }
  .piano-key.out-of-scale { opacity: 0.48; filter: saturate(0.45); }
  .piano-key.scale-root { box-shadow: inset 0 -7px 0 var(--accent); }
  .piano-key:hover { filter: brightness(0.97); }
  .key-label { position: absolute; bottom: 9px; left: 0; right: 0; font-size: 11px; font-weight: 800; }
  .key-shortcut { display: block; margin-top: 2px; color: #898597; font-size: 9px; font-weight: 600; text-transform: uppercase; }
  .black .key-label { bottom: 6px; font-size: 9px; }
  .black .key-shortcut { color: #c7c3d2; }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 9px;
    color: var(--muted);
    font-size: 11px;
  }

  .status { min-height: 16px; }

  @media (max-width: 620px) {
    .app { padding: 9px; border-radius: 12px; }
    .toolbar { gap: 6px; }
    .toolbar button { padding-inline: 9px; }
    .keyboard { height: 150px; }
    .key-shortcut { display: none; }
    .footer { display: block; }
  }
`;
function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}
function clamp2(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
function midiToPitch(midi, preferFlats = false) {
  const pitchClass = (midi % 12 + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  if (preferFlats && [1, 3, 6, 8, 10].includes(pitchClass)) {
    const flatDegree = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 }[pitchClass];
    return { diatonic: octave * 7 + flatDegree, degree: flatDegree, accidental: "\u266D" };
  }
  const [degree, sharp] = PITCH_INFO[pitchClass];
  return { diatonic: octave * 7 + degree, degree, accidental: sharp ? "\u266F" : "" };
}
function diatonicToMidi(diatonic) {
  const octave = Math.floor(diatonic / 7);
  const degree = (diatonic % 7 + 7) % 7;
  return (octave + 1) * 12 + NATURAL_PITCH_CLASSES[degree];
}
function noteName(midi) {
  if (midi < 0) return "Rest";
  return `${NOTE_NAMES[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
function parseTonic(value) {
  const normalized = String(value || "C").trim().replace("\u266F", "#").replace("\u266D", "b");
  const pitchClasses = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    "E#": 5,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11
  };
  return pitchClasses[normalized] ?? clamp2(Number(normalized) || 0, 0, 11);
}
function parseTimeSignature(value) {
  const normalized = TIME_SIGNATURES.includes(value) ? value : "4/4";
  const [numerator, denominator] = normalized.split("/").map(Number);
  return { value: normalized, numerator, denominator, beatsPerMeasure: numerator * 4 / denominator };
}
function keySignatureFor(tonic, scale) {
  const mode = SCALE_MODES[scale] || SCALE_MODES.major;
  const relativeMajor = (tonic + mode.relativeMajorOffset + 120) % 12;
  return MAJOR_KEY_SIGNATURES.get(relativeMajor) ?? 0;
}
function noteTokenToMidi(value) {
  if (/^r(?:est)?$/i.test(value)) return -1;
  const match = value.match(/^([A-Ga-g])([#b]?)(-?\d)$/);
  if (!match) return null;
  const pitchClass = parseTonic(`${match[1].toUpperCase()}${match[2]}`);
  return clamp2((Number(match[3]) + 1) * 12 + pitchClass, 0, 127);
}
function parsePreloadedNotes(source) {
  let cursor = 0;
  const result = [];
  for (const token of String(source || "").trim().split(/\s+/).filter(Boolean)) {
    const match = token.match(/^([^@/]+)(?:@([0-9.]+))?(?:\/([0-9.]+))?$/);
    if (!match) continue;
    const midi = noteTokenToMidi(match[1]);
    if (midi == null) continue;
    const start = match[2] == null ? cursor : Math.max(0, Number(match[2]));
    const duration = Math.max(0.03125, Number(match[3]) || 1);
    result.push({ midi, start, duration });
    cursor = Math.max(cursor, start + duration);
  }
  return result;
}
function readConfiguration(element) {
  const requestedPreset = element.getAttribute("preset") || "free";
  const preset = ["untimed", "timed", "free"].includes(requestedPreset) ? requestedPreset : "free";
  const requestedMode = element.getAttribute("mode") === "timed" ? "timed" : "untimed";
  const mode = preset === "timed" ? "timed" : preset === "untimed" ? "untimed" : requestedMode;
  const bpm = clamp2(Number(element.getAttribute("bpm")) || 120, 20, 300);
  const requestedGrid = Number(String(element.getAttribute("quantize") || "1/16").split("/")[1]);
  const quantize = [4, 8, 16, 32].includes(requestedGrid) ? requestedGrid : 16;
  const octave = clamp2(Number(element.getAttribute("octave")) || 4, 1, 7);
  const tonic = parseTonic(element.getAttribute("key"));
  const requestedScale = String(element.getAttribute("scale") || "major").toLowerCase();
  const scale = Object.hasOwn(SCALE_MODES, requestedScale) ? requestedScale : "major";
  const clef = element.getAttribute("clef") === "bass" ? "bass" : "treble";
  const timeSignature = parseTimeSignature(element.getAttribute("time-signature") || "4/4").value;
  const notes = element.getAttribute("notes") || "";
  return { preset, mode, bpm, quantize, octave, tonic, scale, clef, timeSignature, notes };
}
var MusicScoreApp = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.engine = null;
    this.config = readConfiguration(this);
    this.recording = false;
    this.playbackToken = 0;
    this.playbackVoices = [];
    this.playbackTimers = [];
    this.liveInputs = /* @__PURE__ */ new Map();
    this.activeMidi = /* @__PURE__ */ new Set();
    this.audioContext = null;
    this.pianoSampler = null;
    this.accidental = 0;
    this.staffInput = "note";
    this.themeMessageHandler = null;
    this.connected = false;
  }
  async connectedCallback() {
    if (this.connected) return;
    this.connected = true;
    this.config = readConfiguration(this);
    this.renderShell();
    const wasmUrl = this.getAttribute("engine-url") || new URL("./music_engine.wasm", document.baseURI).href;
    this.engine = await createScoreEngine(wasmUrl);
    if (!this.isConnected) return;
    this.applyConfiguration();
    this.loadPreloadedScore();
    this.bindEvents();
    this.renderAll();
    this.setStatus(`Loading acoustic piano \xB7 ${this.engine.kind}`);
    this.preloadCurrentOctave().then((loaded) => {
      if (this.isConnected) {
        this.setStatus(loaded ? `Ready \xB7 ${this.engine.kind} \xB7 Acoustic piano` : `Ready \xB7 ${this.engine.kind} \xB7 Synth fallback`);
      }
    });
  }
  disconnectedCallback() {
    this.stopPlayback();
    for (const inputId of [...this.liveInputs.keys()]) this.releaseInput(inputId);
    if (this.themeMessageHandler) window.removeEventListener("message", this.themeMessageHandler);
    this.connected = false;
  }
  renderShell() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="app" tabindex="0" aria-label="Interactive music score and piano">
        <div class="toolbar">
          <label id="mode-control">Recording mode
            <select id="mode">
              <option value="untimed">No timing \xB7 quarter notes</option>
              <option value="timed">Timed recording</option>
            </select>
          </label>
          <label><span id="bpm-label">Play speed (BPM)</span>
            <input id="bpm" type="number" min="20" max="300" step="1">
          </label>
          <label id="quantize-control">Quantize
            <select id="quantize">
              <option value="4">1/4</option>
              <option value="8">1/8</option>
              <option value="16">1/16</option>
              <option value="32">1/32</option>
            </select>
          </label>
          <label>Key
            <select id="key">
              ${KEY_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
            </select>
          </label>
          <label>Scale / mode
            <select id="scale">
              ${Object.entries(SCALE_MODES).map(([value, mode]) => `<option value="${value}">${mode.label}</option>`).join("")}
            </select>
          </label>
          <label id="time-control">Time signature
            <select id="time-signature">
              ${TIME_SIGNATURES.map((value) => `<option value="${value}">${value}</option>`).join("")}
            </select>
          </label>
          <label>Staff entry
            <select id="staff-input">
              <option value="note">Note</option>
              <option value="rest">Rest</option>
            </select>
          </label>
          <label id="accidental-control">Accidental
            <select id="accidental">
              <option value="0">Natural \u266E</option>
              <option value="1">Sharp \u266F</option>
            </select>
          </label>
          <span class="spacer"></span>
          <button id="record" class="primary" type="button">\u25CF Record</button>
          <button id="play" type="button">\u25B6 Play</button>
          <button id="stop" type="button">\u25A0 Stop</button>
          <button id="undo" type="button">Undo</button>
          <button id="clear" type="button">Clear</button>
          <button id="download-midi" type="button">Download MIDI</button>
        </div>

        <div class="staff-shell">
          <span class="staff-help">Click the staff to add a note</span>
          <svg id="staff" class="staff" role="img" aria-label="Interactive treble-clef music staff"></svg>
        </div>

        <div class="octave-row">
          <button id="octave-down" type="button" aria-label="Previous octave">\u2212</button>
          <div id="octave-label" class="octave-label">Octave 4</div>
          <button id="octave-up" type="button" aria-label="Next octave">+</button>
        </div>
        <div id="keyboard" class="keyboard" aria-label="Piano keyboard"></div>
        <div class="footer">
          <span id="status" class="status">Loading music engine\u2026</span>
          <span>Keys: A W S E D F T G Y H U J K \xB7 Salamander Grand Piano, CC BY 3.0</span>
        </div>
      </div>
    `;
    this.ui = {
      app: this.shadowRoot.querySelector(".app"),
      mode: this.shadowRoot.querySelector("#mode"),
      modeControl: this.shadowRoot.querySelector("#mode-control"),
      bpm: this.shadowRoot.querySelector("#bpm"),
      bpmLabel: this.shadowRoot.querySelector("#bpm-label"),
      quantize: this.shadowRoot.querySelector("#quantize"),
      quantizeControl: this.shadowRoot.querySelector("#quantize-control"),
      key: this.shadowRoot.querySelector("#key"),
      scale: this.shadowRoot.querySelector("#scale"),
      timeSignature: this.shadowRoot.querySelector("#time-signature"),
      timeControl: this.shadowRoot.querySelector("#time-control"),
      staffInput: this.shadowRoot.querySelector("#staff-input"),
      accidental: this.shadowRoot.querySelector("#accidental"),
      accidentalControl: this.shadowRoot.querySelector("#accidental-control"),
      record: this.shadowRoot.querySelector("#record"),
      play: this.shadowRoot.querySelector("#play"),
      stop: this.shadowRoot.querySelector("#stop"),
      undo: this.shadowRoot.querySelector("#undo"),
      clear: this.shadowRoot.querySelector("#clear"),
      downloadMidi: this.shadowRoot.querySelector("#download-midi"),
      staff: this.shadowRoot.querySelector("#staff"),
      keyboard: this.shadowRoot.querySelector("#keyboard"),
      octaveDown: this.shadowRoot.querySelector("#octave-down"),
      octaveUp: this.shadowRoot.querySelector("#octave-up"),
      octaveLabel: this.shadowRoot.querySelector("#octave-label"),
      status: this.shadowRoot.querySelector("#status")
    };
  }
  applyConfiguration() {
    this.ui.mode.value = this.config.mode;
    this.ui.bpm.value = String(this.config.bpm);
    this.ui.quantize.value = String(this.config.quantize);
    this.ui.key.value = String(this.config.tonic);
    this.ui.scale.value = this.config.scale;
    this.ui.timeSignature.value = this.config.timeSignature;
    this.ui.staffInput.value = this.staffInput;
    this.engine.setMode(this.config.mode === "timed");
    this.engine.setBpm(this.config.bpm);
    this.engine.setGrid(this.config.quantize);
    this.updateControlState();
  }
  loadPreloadedScore() {
    for (const note of parsePreloadedNotes(this.config.notes)) {
      this.engine.addNoteAt(note.midi, note.start, note.duration, note.midi < 0 ? 1 : 96);
    }
  }
  bindEvents() {
    this.ui.mode.addEventListener("change", () => {
      if (this.recording) this.stopRecording();
      this.config.mode = this.ui.mode.value;
      this.engine.setMode(this.config.mode === "timed");
      this.updateControlState();
      this.renderStaff();
    });
    this.ui.bpm.addEventListener("change", () => {
      this.config.bpm = clamp2(Number(this.ui.bpm.value) || 120, 20, 300);
      this.ui.bpm.value = String(this.config.bpm);
      this.engine.setBpm(this.config.bpm);
    });
    this.ui.quantize.addEventListener("change", () => {
      this.config.quantize = Number(this.ui.quantize.value);
      this.engine.setGrid(this.config.quantize);
    });
    this.ui.key.addEventListener("change", () => {
      this.config.tonic = Number(this.ui.key.value);
      this.renderKeyboard();
      this.renderStaff();
    });
    this.ui.scale.addEventListener("change", () => {
      this.config.scale = this.ui.scale.value;
      this.renderKeyboard();
      this.renderStaff();
    });
    this.ui.timeSignature.addEventListener("change", () => {
      this.config.timeSignature = this.ui.timeSignature.value;
      this.renderStaff();
    });
    this.ui.staffInput.addEventListener("change", () => {
      this.staffInput = this.ui.staffInput.value;
      this.updateControlState();
      this.setStatus(this.staffInput === "rest" ? "Click the staff to add a rest" : "Click the staff to add a note");
    });
    this.ui.accidental.addEventListener("change", () => {
      this.accidental = Number(this.ui.accidental.value);
    });
    this.ui.record.addEventListener("click", () => this.recording ? this.stopRecording() : this.startRecording());
    this.ui.play.addEventListener("click", () => this.play());
    this.ui.stop.addEventListener("click", () => {
      if (this.recording) this.stopRecording();
      this.stopPlayback();
      this.setStatus("Stopped");
    });
    this.ui.undo.addEventListener("click", () => {
      this.engine.undo();
      this.renderStaff();
      this.setStatus("Removed the last entered note");
    });
    this.ui.clear.addEventListener("click", () => {
      if (this.recording) this.stopRecording();
      this.stopPlayback();
      this.engine.reset();
      this.applyConfiguration();
      this.renderStaff();
      this.setStatus("Score cleared");
    });
    this.ui.downloadMidi.addEventListener("click", () => this.downloadMidi());
    this.ui.octaveDown.addEventListener("click", () => this.changeOctave(-1));
    this.ui.octaveUp.addEventListener("click", () => this.changeOctave(1));
    this.ui.staff.addEventListener("pointerdown", (event) => this.handleStaffPointer(event));
    this.ui.app.addEventListener("keydown", (event) => this.handleComputerKeyDown(event));
    this.ui.app.addEventListener("keyup", (event) => this.handleComputerKeyUp(event));
    this.ui.app.addEventListener("blur", () => {
      for (const id of [...this.liveInputs.keys()].filter((id2) => id2.startsWith("key:"))) this.releaseInput(id);
    });
    this.themeMessageHandler = (event) => {
      if (event.data?.type === "music-score-theme" && ["light", "dark"].includes(event.data.theme)) {
        this.setAttribute("theme", event.data.theme);
      }
    };
    window.addEventListener("message", this.themeMessageHandler);
  }
  updateControlState() {
    const timed = this.config.mode === "timed";
    this.ui.modeControl.classList.toggle("hidden", this.config.preset !== "free");
    this.ui.quantizeControl.classList.toggle("hidden", this.config.preset === "untimed");
    this.ui.timeControl.classList.toggle("hidden", !timed);
    this.ui.bpm.disabled = false;
    this.ui.quantize.disabled = !timed;
    this.ui.bpmLabel.textContent = timed ? "BPM" : "Play speed (BPM)";
    this.ui.accidentalControl.classList.toggle("hidden", this.staffInput === "rest");
    this.ui.octaveDown.disabled = this.config.octave <= 1;
    this.ui.octaveUp.disabled = this.config.octave >= 7;
  }
  renderAll() {
    this.renderKeyboard();
    this.renderStaff();
    this.updateControlState();
  }
  renderKeyboard() {
    const keyboard = this.ui.keyboard;
    keyboard.replaceChildren();
    const baseMidi = (this.config.octave + 1) * 12;
    const whiteOffsets = [0, 2, 4, 5, 7, 9, 11, 12];
    const blackKeys = [
      [1, 1],
      [3, 2],
      [6, 4],
      [8, 5],
      [10, 6]
    ];
    const scalePitchClasses = new Set(
      SCALE_MODES[this.config.scale].intervals.map((interval) => (this.config.tonic + interval) % 12)
    );
    const keyClasses = (midi, colour) => {
      const pitchClass = (midi % 12 + 12) % 12;
      return [
        "piano-key",
        colour,
        this.activeMidi.has(midi) ? "active" : "",
        scalePitchClasses.has(pitchClass) ? "" : "out-of-scale",
        pitchClass === this.config.tonic ? "scale-root" : ""
      ].filter(Boolean).join(" ");
    };
    for (const [index, offset] of whiteOffsets.entries()) {
      const midi = baseMidi + offset;
      const button = document.createElement("button");
      button.type = "button";
      button.className = keyClasses(midi, "white");
      button.dataset.midi = String(midi);
      button.style.gridColumn = String(index + 1);
      button.innerHTML = `<span class="key-label">${noteName(midi)}<span class="key-shortcut">${COMPUTER_KEYS[KEY_OFFSETS.indexOf(offset)] || ""}</span></span>`;
      this.bindPianoPointer(button, midi);
      keyboard.append(button);
    }
    for (const [offset, boundary] of blackKeys) {
      const midi = baseMidi + offset;
      const button = document.createElement("button");
      button.type = "button";
      button.className = keyClasses(midi, "black");
      button.dataset.midi = String(midi);
      button.style.left = `calc(${boundary * 12.5}% - 3.75%)`;
      button.innerHTML = `<span class="key-label">${noteName(midi)}<span class="key-shortcut">${COMPUTER_KEYS[KEY_OFFSETS.indexOf(offset)]}</span></span>`;
      this.bindPianoPointer(button, midi);
      keyboard.append(button);
    }
    this.ui.octaveLabel.textContent = `C${this.config.octave}\u2013C${this.config.octave + 1}`;
  }
  bindPianoPointer(button, midi) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.ui.app.focus();
      button.setPointerCapture(event.pointerId);
      this.pressInput(`pointer:${event.pointerId}`, midi);
    });
    const release = (event) => this.releaseInput(`pointer:${event.pointerId}`);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }
  changeOctave(delta) {
    this.config.octave = clamp2(this.config.octave + delta, 1, 7);
    this.renderKeyboard();
    this.updateControlState();
    this.preloadCurrentOctave();
  }
  handleComputerKeyDown(event) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const index = COMPUTER_KEYS.indexOf(event.key.toLowerCase());
    if (index < 0) return;
    event.preventDefault();
    const midi = (this.config.octave + 1) * 12 + KEY_OFFSETS[index];
    this.pressInput(`key:${event.key.toLowerCase()}`, midi);
  }
  handleComputerKeyUp(event) {
    const id = `key:${event.key.toLowerCase()}`;
    if (!this.liveInputs.has(id)) return;
    event.preventDefault();
    this.releaseInput(id);
  }
  initializeAudio() {
    if (!sharedAudioContext) sharedAudioContext = new AudioContext();
    this.audioContext = sharedAudioContext;
    if (!this.pianoSampler) {
      const baseUrl = this.getAttribute("sample-base-url") || DEFAULT_PIANO_SAMPLE_URL;
      if (!sharedPianoSamplers.has(baseUrl)) {
        sharedPianoSamplers.set(baseUrl, new AcousticPianoSampler(this.audioContext, baseUrl));
      }
      this.pianoSampler = sharedPianoSamplers.get(baseUrl);
    }
    return this.audioContext;
  }
  async ensureAudio() {
    this.initializeAudio();
    if (this.audioContext.state === "suspended") await this.audioContext.resume();
    return this.audioContext;
  }
  async preparePianoSamples(midiNotes) {
    try {
      this.initializeAudio();
      await this.pianoSampler.preload(midiNotes);
      return true;
    } catch (error) {
      console.warn("Music Score App: acoustic-piano samples could not be loaded.", error);
      return false;
    }
  }
  preloadCurrentOctave() {
    const baseMidi = (this.config.octave + 1) * 12;
    return this.preparePianoSamples(KEY_OFFSETS.map((offset) => baseMidi + offset));
  }
  async pressInput(inputId, midi) {
    if (this.liveInputs.has(inputId)) return;
    this.liveInputs.set(inputId, { midi, voice: null });
    this.activeMidi.add(midi);
    this.updateActiveKeys();
    if (this.recording) {
      this.engine.noteOn(midi, performance.now(), 96);
      if (this.config.mode === "untimed") this.renderStaff();
    }
    this.setStatus(`${noteName(midi)}${this.recording ? " recorded" : ""}`);
    const context = await this.ensureAudio();
    await this.preparePianoSamples([midi]);
    const pendingInput = this.liveInputs.get(inputId);
    if (!this.isConnected || !pendingInput) return;
    pendingInput.voice = this.createVoice(context, midi, context.currentTime, null, 0.72);
  }
  releaseInput(inputId) {
    const input = this.liveInputs.get(inputId);
    if (!input) return;
    this.releaseVoice(input.voice);
    this.liveInputs.delete(inputId);
    if (![...this.liveInputs.values()].some((item) => item.midi === input.midi)) this.activeMidi.delete(input.midi);
    this.updateActiveKeys();
    if (this.recording) {
      this.engine.noteOff(input.midi, performance.now());
      if (this.config.mode === "timed") this.renderStaff();
    }
  }
  updateActiveKeys() {
    for (const key of this.ui.keyboard.querySelectorAll(".piano-key")) {
      key.classList.toggle("active", this.activeMidi.has(Number(key.dataset.midi)));
    }
  }
  createVoice(context, midi, startTime, duration = null, volume = 0.7) {
    const acousticVoice = this.pianoSampler?.createVoice(midi, startTime, duration, volume);
    if (acousticVoice) return acousticVoice;
    return this.createFallbackVoice(context, midi, startTime, duration, volume);
  }
  createFallbackVoice(context, midi, startTime, duration = null, volume = 0.7) {
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    const gain = context.createGain();
    const frequency = midiToFrequency(midi);
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(frequency * 2, startTime);
    overtoneGain.gain.setValueAtTime(0.18, startTime);
    gain.gain.setValueAtTime(1e-4, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.025, volume * 0.22), startTime + 0.012);
    oscillator.connect(gain);
    overtone.connect(overtoneGain).connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    overtone.start(startTime);
    const voice = { sources: [oscillator, overtone], gain, released: false, acoustic: false };
    if (duration != null) {
      const releaseAt = startTime + Math.max(0.04, duration);
      gain.gain.setValueAtTime(Math.max(1e-4, volume * 0.17), releaseAt);
      gain.gain.exponentialRampToValueAtTime(1e-4, releaseAt + 0.16);
      oscillator.stop(releaseAt + 0.18);
      overtone.stop(releaseAt + 0.18);
      voice.released = true;
    }
    return voice;
  }
  releaseVoice(voice) {
    if (!voice || voice.released || !this.audioContext) return;
    voice.released = true;
    const now = this.audioContext.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(1e-4, voice.gain.gain.value), now);
    voice.gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.12);
    for (const source of voice.sources) {
      try {
        source.stop(now + (voice.acoustic ? 0.28 : 0.14));
      } catch {
      }
    }
  }
  startRecording() {
    this.stopPlayback();
    this.recording = true;
    this.engine.startRecording(performance.now());
    this.ui.record.textContent = "\u25A0 Finish";
    this.ui.record.classList.add("recording");
    this.setStatus(this.config.mode === "timed" ? "Recording timing\u2026" : "Recording quarter notes\u2026");
  }
  stopRecording() {
    this.engine.stopRecording(performance.now());
    this.recording = false;
    this.ui.record.textContent = "\u25CF Record";
    this.ui.record.classList.remove("recording");
    this.renderStaff();
    this.setStatus("Recording finished");
  }
  downloadMidi() {
    const notes = this.engine.getNotes();
    if (!notes.length) {
      this.setStatus("Add or preload notes before downloading MIDI");
      return;
    }
    const bytes = createMidiFile(notes, {
      bpm: this.config.bpm,
      timeSignature: this.config.timeSignature,
      keySignature: keySignatureFor(this.config.tonic, this.config.scale),
      isMinor: this.config.scale === "minor"
    });
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/midi" }));
    const keyLabel = KEY_OPTIONS.find(([value]) => value === this.config.tonic)?.[1] || "C";
    const filename = `${keyLabel.split(" ")[0].replace("\u266F", "sharp").replace("\u266D", "flat")}-${this.config.scale}-score.mid`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
    this.setStatus("MIDI file downloaded");
  }
  async play() {
    const notes = this.engine.getNotes();
    if (!notes.length) {
      this.setStatus("Add or record notes first");
      return;
    }
    if (this.recording) this.stopRecording();
    this.stopPlayback();
    const context = await this.ensureAudio();
    this.setStatus("Loading acoustic piano samples\u2026");
    await this.preparePianoSamples(notes.filter((note) => note.midi >= 0).map((note) => note.midi));
    const token = ++this.playbackToken;
    const secondsPerBeat = 60 / this.config.bpm;
    const startAt = context.currentTime + 0.08;
    const finalBeat = Math.max(...notes.map((note) => note.start + note.duration));
    notes.forEach((note, index) => {
      const noteStart = startAt + note.start * secondsPerBeat;
      const duration = note.duration * secondsPerBeat;
      if (note.midi >= 0) {
        const voice = this.createVoice(context, note.midi, noteStart, duration, note.velocity / 127);
        this.playbackVoices.push(voice);
      }
      const timer = window.setTimeout(() => {
        if (token !== this.playbackToken) return;
        this.markPlaying(index, true);
        window.setTimeout(() => token === this.playbackToken && this.markPlaying(index, false), duration * 1e3);
      }, Math.max(0, (noteStart - context.currentTime) * 1e3));
      this.playbackTimers.push(timer);
    });
    this.playbackTimers.push(window.setTimeout(() => {
      if (token !== this.playbackToken) return;
      this.playbackVoices = [];
      this.setStatus("Playback finished");
      this.renderStaff();
    }, (0.1 + finalBeat * secondsPerBeat + 0.25) * 1e3));
    this.setStatus(`Playing at ${this.config.bpm} BPM`);
  }
  stopPlayback() {
    this.playbackToken += 1;
    for (const timer of this.playbackTimers) clearTimeout(timer);
    this.playbackTimers = [];
    for (const voice of this.playbackVoices) {
      for (const source of voice.sources) {
        try {
          source.stop();
        } catch {
        }
      }
    }
    this.playbackVoices = [];
    for (const note of this.ui?.staff?.querySelectorAll(".msa-note.playing") || []) note.classList.remove("playing");
  }
  markPlaying(index, playing) {
    this.ui.staff.querySelector(`[data-note-index="${index}"]`)?.classList.toggle("playing", playing);
  }
  handleStaffPointer(event) {
    if (!this.engine || event.button !== 0) return;
    if (event.target.closest?.(".clef")) {
      this.config.clef = this.config.clef === "treble" ? "bass" : "treble";
      this.renderStaff();
      this.setStatus(`${this.config.clef === "treble" ? "Treble" : "Bass"} clef selected`);
      return;
    }
    if (event.target.closest?.(".time-signature")) {
      try {
        if (typeof this.ui.timeSignature.showPicker === "function") this.ui.timeSignature.showPicker();
        else this.ui.timeSignature.focus();
      } catch {
        this.ui.timeSignature.focus();
      }
      return;
    }
    if (event.target.closest?.(".msa-note")) {
      const midi2 = Number(event.target.closest(".msa-note").dataset.midi);
      if (midi2 >= 0) {
        this.ensureAudio().then(async (context) => {
          await this.preparePianoSamples([midi2]);
          this.createVoice(context, midi2, context.currentTime, 0.3, 0.65);
        });
      }
      this.setStatus(noteName(midi2));
      return;
    }
    const svg = this.ui.staff;
    const rect = svg.getBoundingClientRect();
    const viewWidth = Number(svg.getAttribute("width")) || rect.width;
    const x = (event.clientX - rect.left) * viewWidth / rect.width;
    const y = (event.clientY - rect.top) * 176 / rect.height;
    if (y < 20 || y > 150) return;
    const bottomDiatonic = this.config.clef === "treble" ? E4_DIATONIC : 18;
    const diatonic = bottomDiatonic + Math.round((STAFF_BOTTOM_Y - y) / STAFF_HALF_STEP);
    const midi = this.staffInput === "rest" ? -1 : clamp2(diatonicToMidi(diatonic) + this.accidental, 0, 127);
    const grid = this.config.mode === "timed" ? 4 / this.config.quantize : 1;
    const rawBeat = Math.max(0, (x - this.musicStartX()) / BEAT_WIDTH);
    const snappedBeat = Math.round(rawBeat / grid) * grid;
    const duration = this.config.mode === "timed" ? 4 / this.config.quantize : 1;
    this.engine.addNoteAt(midi, snappedBeat, duration, midi < 0 ? 1 : 96);
    this.renderStaff();
    this.setStatus(`Added ${noteName(midi)}`);
  }
  musicStartX() {
    const signatureWidth = Math.abs(keySignatureFor(this.config.tonic, this.config.scale)) * 9;
    return 88 + signatureWidth + (this.config.mode === "timed" ? 38 : 10);
  }
  renderStaff() {
    if (!this.engine) return;
    const svg = this.ui.staff;
    const notes = this.engine.getNotes();
    const timeSignature = parseTimeSignature(this.config.timeSignature);
    const endBeat = Math.max(
      this.config.mode === "timed" ? timeSignature.beatsPerMeasure * 2 : 8,
      this.engine.endBeat() + 1
    );
    const musicStart = this.musicStartX();
    const width = Math.max(760, musicStart + endBeat * BEAT_WIDTH + 36);
    svg.setAttribute("viewBox", `0 0 ${width} 176`);
    svg.setAttribute("width", String(width));
    svg.style.width = `${width}px`;
    svg.replaceChildren();
    for (let line = 0; line < 5; line += 1) {
      const y = 54 + line * 12;
      svg.append(svgElement("line", { x1: 20, y1: y, x2: width - 20, y2: y, class: "staff-line" }));
    }
    const clef = svgElement("text", { x: 26, y: this.config.clef === "treble" ? 112 : 101, class: "clef" });
    clef.textContent = this.config.clef === "treble" ? "\u{1D11E}" : "\u{1D122}";
    svg.append(clef);
    this.drawKeySignature(svg);
    if (this.config.mode === "timed") {
      const signatureX = musicStart - 31;
      const signatureGroup = svgElement("g", { class: "time-signature" });
      const top = svgElement("text", { x: signatureX, y: 76, class: "time-signature" });
      const bottom = svgElement("text", { x: signatureX, y: 99, class: "time-signature" });
      top.textContent = String(timeSignature.numerator);
      bottom.textContent = String(timeSignature.denominator);
      signatureGroup.append(top, bottom);
      svg.append(signatureGroup);
      for (let beat = 1; beat <= endBeat; beat += 1) {
        const x = musicStart + beat * BEAT_WIDTH;
        svg.append(svgElement("line", {
          x1: x,
          y1: 54,
          x2: x,
          y2: 102,
          class: "beat-guide"
        }));
      }
      for (let beat = timeSignature.beatsPerMeasure; beat <= endBeat; beat += timeSignature.beatsPerMeasure) {
        const x = musicStart + beat * BEAT_WIDTH - 12;
        svg.append(svgElement("line", { x1: x, y1: 54, x2: x, y2: 102, class: "bar-line" }));
      }
      const grid = 4 / this.config.quantize;
      for (let beat = grid; beat <= endBeat; beat += grid) {
        if (Math.abs(beat - Math.round(beat)) < 1e-4) continue;
        const x = musicStart + beat * BEAT_WIDTH;
        svg.append(svgElement("line", { x1: x, y1: 96, x2: x, y2: 102, class: "subdivision-guide" }));
      }
    }
    notes.forEach((note, index) => this.drawNote(svg, note, index));
  }
  drawKeySignature(svg) {
    const count = keySignatureFor(this.config.tonic, this.config.scale);
    if (count === 0) return;
    const symbol = count > 0 ? "\u266F" : "\u266D";
    const positions = count > 0 ? SHARP_DIATONIC[this.config.clef] : FLAT_DIATONIC[this.config.clef];
    const bottomDiatonic = this.config.clef === "treble" ? E4_DIATONIC : 18;
    for (let index = 0; index < Math.abs(count); index += 1) {
      const y = STAFF_BOTTOM_Y - (positions[index] - bottomDiatonic) * STAFF_HALF_STEP;
      const accidental = svgElement("text", { x: 75 + index * 9, y: y + 7, class: "key-signature" });
      accidental.textContent = symbol;
      svg.append(accidental);
    }
  }
  drawNote(svg, note, index) {
    const x = this.musicStartX() + note.start * BEAT_WIDTH;
    const group = svgElement("g", {
      class: "msa-note",
      "data-note-index": index,
      "data-midi": note.midi,
      "aria-label": `${noteName(note.midi)}, beat ${note.start}`
    });
    if (note.midi < 0) {
      this.drawRest(group, x, note.duration);
      svg.append(group);
      return;
    }
    const keySignature = keySignatureFor(this.config.tonic, this.config.scale);
    const { diatonic, degree, accidental: writtenAccidental } = midiToPitch(note.midi, keySignature < 0);
    const bottomDiatonic = this.config.clef === "treble" ? E4_DIATONIC : 18;
    const y = STAFF_BOTTOM_Y - (diatonic - bottomDiatonic) * STAFF_HALF_STEP;
    if (y >= 108) {
      for (let lineY = 114; lineY <= y + 1; lineY += 12) {
        group.append(svgElement("line", { x1: x - 11, y1: lineY, x2: x + 11, y2: lineY, class: "ledger" }));
      }
    }
    if (y <= 48) {
      for (let lineY = 42; lineY >= y - 1; lineY -= 12) {
        group.append(svgElement("line", { x1: x - 11, y1: lineY, x2: x + 11, y2: lineY, class: "ledger" }));
      }
    }
    const whole = note.duration >= 3.5;
    const half = note.duration >= 1.75;
    const hollow = whole || half;
    const head = svgElement("ellipse", {
      cx: x,
      cy: y,
      rx: 7.2,
      ry: 4.8,
      transform: `rotate(-18 ${x} ${y})`,
      class: `note-head${hollow ? " hollow" : ""}`
    });
    group.append(head);
    const signatureDegrees = keySignature > 0 ? [3, 0, 4, 1, 5, 2, 6].slice(0, keySignature) : [6, 2, 5, 1, 4, 0, 3].slice(0, Math.abs(keySignature));
    let displayedAccidental = writtenAccidental;
    if (writtenAccidental === "\u266F" && keySignature > 0 && signatureDegrees.includes(degree)) displayedAccidental = "";
    if (writtenAccidental === "\u266D" && keySignature < 0 && signatureDegrees.includes(degree)) displayedAccidental = "";
    if (!writtenAccidental && signatureDegrees.includes(degree)) displayedAccidental = "\u266E";
    if (displayedAccidental) {
      const accidental = svgElement("text", { x: x - 18, y: y + 7, class: "accidental" });
      accidental.textContent = displayedAccidental;
      group.append(accidental);
    }
    if (!whole) {
      const stemsUp = y >= 78;
      const stemX = stemsUp ? x + 6 : x - 6;
      const stemEndY = stemsUp ? y - 34 : y + 34;
      group.append(svgElement("line", { x1: stemX, y1: y, x2: stemX, y2: stemEndY, class: "stem", "stroke-width": 1.6 }));
      let flags = 0;
      if (note.duration < 0.75) flags = 1;
      if (note.duration < 0.375) flags = 2;
      if (note.duration < 0.1875) flags = 3;
      for (let flag = 0; flag < flags; flag += 1) {
        const direction = stemsUp ? 1 : -1;
        const startY = stemEndY + flag * 7 * direction;
        const path = svgElement("path", {
          d: stemsUp ? `M ${stemX} ${startY} Q ${stemX + 13} ${startY + 5} ${stemX + 8} ${startY + 15}` : `M ${stemX} ${startY} Q ${stemX - 13} ${startY - 5} ${stemX - 8} ${startY - 15}`,
          class: "flag",
          fill: "none",
          "stroke-width": 2
        });
        group.append(path);
      }
    }
    svg.append(group);
  }
  drawRest(group, x, duration) {
    if (duration >= 3.5) {
      group.append(svgElement("rect", { x: x - 7, y: 66, width: 14, height: 5, class: "rest-symbol" }));
      return;
    }
    if (duration >= 1.75) {
      group.append(svgElement("rect", { x: x - 7, y: 78, width: 14, height: 5, class: "rest-symbol" }));
      return;
    }
    if (duration >= 0.75) {
      group.append(svgElement("path", {
        d: `M ${x + 2} 61 l -7 13 l 9 7 l -8 14 l 5 7`,
        class: "rest-symbol",
        fill: "none",
        "stroke-width": 3
      }));
      return;
    }
    const flags = duration < 0.1875 ? 3 : duration < 0.375 ? 2 : 1;
    group.append(svgElement("line", { x1: x + 3, y1: 63, x2: x - 2, y2: 99, class: "rest-symbol", "stroke-width": 2 }));
    for (let flag = 0; flag < flags; flag += 1) {
      group.append(svgElement("circle", { cx: x + 3, cy: 68 + flag * 9, r: 4, class: "rest-symbol" }));
    }
  }
  setStatus(message) {
    if (this.ui?.status) this.ui.status.textContent = message;
  }
};
function defineMusicScoreApp() {
  if (!customElements.get("music-score-app")) customElements.define("music-score-app", MusicScoreApp);
}
defineMusicScoreApp();

// integrations/obsidian/src/main.ts
function parseConfiguration(source) {
  const values = /* @__PURE__ */ new Map();
  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^([a-z-]+)\s*:\s*(.+)$/i);
    if (match) values.set(match[1].toLowerCase(), match[2].trim());
  }
  const requestedMode = (values.get("mode") || "untimed").toLowerCase();
  const requestedPreset = (values.get("preset") || "free").toLowerCase();
  const requestedBpm = Number(values.get("bpm") || 120);
  const requestedQuantize = values.get("quantize") || "1/16";
  const requestedOctave = Number(values.get("octave") || 4);
  return {
    preset: ["untimed", "timed", "free"].includes(requestedPreset) ? requestedPreset : "free",
    mode: requestedMode === "timed" ? "timed" : "untimed",
    bpm: Math.min(300, Math.max(20, Number.isFinite(requestedBpm) ? requestedBpm : 120)),
    quantize: ["1/4", "1/8", "1/16", "1/32"].includes(requestedQuantize) ? requestedQuantize : "1/16",
    octave: Math.min(7, Math.max(1, Number.isFinite(requestedOctave) ? requestedOctave : 4)),
    key: values.get("key") || "C",
    scale: values.get("scale") || "major",
    clef: values.get("clef") === "bass" ? "bass" : "treble",
    "time-signature": values.get("time-signature") || "4/4",
    notes: values.get("notes") || ""
  };
}
var MusicScorePlugin = class extends import_obsidian.Plugin {
  async onload() {
    defineMusicScoreApp();
    const syncTheme = () => {
      const theme = document.body.classList.contains("theme-dark") ? "dark" : "light";
      document.querySelectorAll("music-score-app").forEach((app) => app.setAttribute("theme", theme));
    };
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    this.register(() => themeObserver.disconnect());
    this.registerMarkdownCodeBlockProcessor(
      "music-score",
      (source, element) => this.mount(source, element)
    );
    this.registerMarkdownPostProcessor(
      (element, _context) => {
        for (const callout of element.querySelectorAll(
          '.callout[data-callout="music-score"]'
        )) {
          if (callout.dataset.musicScoreMounted === "true") continue;
          const content = callout.querySelector(".callout-content");
          if (!content) continue;
          const source = content.innerText;
          content.replaceChildren();
          this.mount(source, content);
          callout.dataset.musicScoreMounted = "true";
        }
      }
    );
  }
  mount(source, parent) {
    const config = parseConfiguration(source);
    const app = document.createElement("music-score-app");
    app.classList.add("music-score-app-obsidian");
    for (const [name, value] of Object.entries(config)) app.setAttribute(name, String(value));
    app.setAttribute("theme", document.body.classList.contains("theme-dark") ? "dark" : "light");
    const adapter = this.app.vault.adapter;
    const enginePath = ".obsidian/plugins/music-score-app/music_engine.wasm";
    app.setAttribute("engine-url", adapter.getResourcePath(enginePath));
    parent.append(app);
  }
};
