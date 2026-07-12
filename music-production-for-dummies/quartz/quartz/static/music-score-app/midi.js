function variableLengthQuantity(value) {
  let buffer = value & 0x7f
  const bytes = []
  while ((value >>= 7) > 0) {
    buffer <<= 8
    buffer |= (value & 0x7f) | 0x80
  }
  while (true) {
    bytes.push(buffer & 0xff)
    if (buffer & 0x80) buffer >>= 8
    else break
  }
  return bytes
}

function integer32(value) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]
}

export function createMidiFile(notes, options = {}) {
  const ticksPerBeat = 480
  const bpm = Math.min(300, Math.max(20, Number(options.bpm) || 120))
  const signatureMatch = String(options.timeSignature || "4/4").match(/^(\d+)\/(4|8)$/)
  const numerator = Number(signatureMatch?.[1] || 4)
  const denominator = Number(signatureMatch?.[2] || 4)
  const microsecondsPerBeat = Math.round(60000000 / bpm)
  const keySignature = Math.min(7, Math.max(-7, Number(options.keySignature) || 0))
  const events = [
    { tick: 0, order: -4, bytes: [0xff, 0x51, 0x03, (microsecondsPerBeat >>> 16) & 0xff, (microsecondsPerBeat >>> 8) & 0xff, microsecondsPerBeat & 0xff] },
    { tick: 0, order: -3, bytes: [0xff, 0x58, 0x04, numerator, Math.log2(denominator), 24, 8] },
    { tick: 0, order: -2, bytes: [0xff, 0x59, 0x02, keySignature & 0xff, options.isMinor ? 1 : 0] },
  ]
  let endTick = 0

  for (const note of notes) {
    const startTick = Math.max(0, Math.round(note.start * ticksPerBeat))
    const finishTick = Math.max(startTick + 1, Math.round((note.start + note.duration) * ticksPerBeat))
    endTick = Math.max(endTick, finishTick)
    if (note.midi < 0) continue
    events.push({ tick: startTick, order: 1, bytes: [0x90, note.midi, note.velocity] })
    events.push({ tick: finishTick, order: 0, bytes: [0x80, note.midi, 0] })
  }

  events.sort((a, b) => a.tick - b.tick || a.order - b.order)
  const track = []
  let previousTick = 0
  for (const event of events) {
    track.push(...variableLengthQuantity(event.tick - previousTick), ...event.bytes)
    previousTick = event.tick
  }
  track.push(...variableLengthQuantity(Math.max(0, endTick - previousTick)), 0xff, 0x2f, 0x00)

  return new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01, (ticksPerBeat >>> 8) & 0xff, ticksPerBeat & 0xff,
    0x4d, 0x54, 0x72, 0x6b, ...integer32(track.length), ...track,
  ])
}
