const VALID_GRIDS = new Set([4, 8, 16, 32])

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

class JavaScriptScoreEngine {
  constructor() {
    this.notes = []
    this.active = new Map()
    this.undoIds = []
    this.nextId = 1
    this.timed = false
    this.recording = false
    this.bpm = 120
    this.denominator = 16
    this.startedMs = 0
    this.baseBeat = 0
    this.kind = "JavaScript fallback"
  }

  get grid() {
    return 4 / this.denominator
  }

  reset() {
    this.notes = []
    this.active.clear()
    this.undoIds = []
    this.nextId = 1
    this.recording = false
  }

  setMode(timed) {
    this.timed = Boolean(timed)
  }

  setBpm(value) {
    this.bpm = clamp(Number(value) || 120, 20, 300)
  }

  setGrid(denominator) {
    const parsed = Number(denominator)
    this.denominator = VALID_GRIDS.has(parsed) ? parsed : 16
  }

  quantize(beat) {
    return Math.round(beat / this.grid) * this.grid
  }

  endBeat() {
    return this.notes.reduce((end, note) => Math.max(end, note.start + note.duration), 0)
  }

  elapsedBeat(nowMs) {
    return this.baseBeat + Math.max(0, nowMs - this.startedMs) * this.bpm / 60000
  }

  add(midi, start, duration, velocity = 96) {
    // MIDI -1 represents a rest entered on the staff.
    if (this.notes.length >= 512 || midi < -1 || midi > 127) return
    const note = {
      id: this.nextId++,
      midi,
      start: Math.max(0, start),
      duration: Math.max(this.grid, duration),
      velocity: clamp(velocity, 1, 127),
    }
    this.notes.push(note)
    this.undoIds.push(note.id)
    this.notes.sort((a, b) => a.start - b.start || a.midi - b.midi)
  }

  startRecording(nowMs) {
    this.recording = true
    this.startedMs = nowMs
    this.baseBeat = this.endBeat()
  }

  stopRecording(nowMs) {
    if (this.timed) {
      for (const midi of [...this.active.keys()]) this.noteOff(midi, nowMs)
    }
    this.recording = false
  }

  noteOn(midi, nowMs, velocity = 96) {
    if (!this.recording) return
    if (!this.timed) {
      this.add(midi, this.endBeat(), 1, velocity)
      return
    }
    if (this.active.has(midi)) return
    this.active.set(midi, {
      start: this.quantize(this.elapsedBeat(nowMs)),
      velocity,
    })
  }

  noteOff(midi, nowMs) {
    if (!this.timed) return
    const active = this.active.get(midi)
    if (!active) return
    const end = this.quantize(this.elapsedBeat(nowMs))
    this.add(midi, active.start, Math.max(this.grid, end - active.start), active.velocity)
    this.active.delete(midi)
  }

  addNoteAt(midi, start, duration, velocity = 96) {
    if (this.timed) {
      this.add(midi, this.quantize(start), Math.max(this.grid, this.quantize(duration)), velocity)
    } else {
      this.add(midi, this.endBeat(), 1, velocity)
    }
  }

  undo() {
    const id = this.undoIds.pop()
    if (id == null) return
    this.notes = this.notes.filter((note) => note.id !== id)
  }

  getNotes() {
    return this.notes.map((note) => ({ ...note }))
  }
}

function wasmFunction(exports, name) {
  const fn = exports[name] ?? exports[`_${name}`]
  if (typeof fn !== "function") throw new Error(`Missing WebAssembly export: ${name}`)
  return fn
}

function wrapWasm(instance) {
  const exports = instance.exports
  const call = (name) => wasmFunction(exports, name)
  const version = call("engine_version")()
  if (version !== 1) throw new Error(`Unsupported music engine version: ${version}`)

  return {
    kind: "C++ / WebAssembly",
    reset: () => call("engine_reset")(),
    setMode: (timed) => call("engine_set_mode")(timed ? 1 : 0),
    setBpm: (bpm) => call("engine_set_bpm")(bpm),
    setGrid: (denominator) => call("engine_set_grid")(denominator),
    startRecording: (nowMs) => call("engine_start_recording")(nowMs),
    stopRecording: (nowMs) => call("engine_stop_recording")(nowMs),
    noteOn: (midi, nowMs, velocity = 96) =>
      call("engine_note_on")(midi, nowMs, velocity),
    noteOff: (midi, nowMs) => call("engine_note_off")(midi, nowMs),
    addNoteAt: (midi, start, duration, velocity = 96) =>
      call("engine_add_note_at")(midi, start, duration, velocity),
    undo: () => call("engine_undo")(),
    endBeat: () => call("engine_end_beat")(),
    getNotes: () => {
      const count = call("engine_note_count")()
      const result = []
      for (let index = 0; index < count; index += 1) {
        result.push({
          id: call("engine_note_id")(index),
          midi: call("engine_note_midi")(index),
          start: call("engine_note_start")(index),
          duration: call("engine_note_duration")(index),
          velocity: call("engine_note_velocity")(index),
        })
      }
      return result
    },
  }
}

const wasiImports = {
  proc_exit() {},
  fd_close() { return 0 },
  fd_seek() { return 0 },
  fd_write() { return 0 },
  environ_get() { return 0 },
  environ_sizes_get() { return 0 },
}

export async function createScoreEngine(wasmUrl) {
  if (wasmUrl) {
    try {
      const imports = { env: {}, wasi_snapshot_preview1: wasiImports }
      const response = await fetch(wasmUrl)
      if (!response.ok) throw new Error(`WebAssembly request returned ${response.status}`)
      const bytes = await response.arrayBuffer()
      const { instance } = await WebAssembly.instantiate(bytes, imports)
      return wrapWasm(instance)
    } catch (error) {
      console.info("Music Score App: using the JavaScript engine until music_engine.wasm is built.", error)
    }
  }

  return new JavaScriptScoreEngine()
}

export { JavaScriptScoreEngine }
