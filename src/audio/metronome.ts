/** Audio-clock scheduler, independent of exercise and UI logic. */
export class Metronome {
  private context = new AudioContext();
  private output = this.context.createGain();
  constructor(volume = 100) {
    this.output.connect(this.context.destination);
    this.setVolume(volume);
  }
  setVolume(volume: number) {
    this.output.gain.value = Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) / 100 : 1;
  }
  private timer: ReturnType<typeof setInterval> | undefined;
  private tempo = 60;
  private nextAt = 0;
  setTempo(bpm: number) { if (Number.isFinite(bpm)) this.tempo = Math.max(30, Math.min(240, bpm)); }
  private next = 0;
  private origin = 0;
  private closed = false;
  async prepare() { await this.context.resume(); }
  originTimestamp() { return performance.now() + (this.origin - this.context.currentTime) * 1000; }
  async start(bpm: number, beats: number, audible: boolean, beatsPerBar = 4, beatTimes?: number[]) {
    await this.context.resume();
    if (this.closed) return;
    if (this.context.state !== 'running') throw new Error('Audio could not start. Try again.');
    this.origin = this.context.currentTime + 0.12;
    this.tempo = bpm; this.nextAt = this.origin;
    const schedule = () => {
      while (this.next < beats && (beatTimes ? this.origin + beatTimes[this.next] : this.nextAt) < this.context.currentTime + 0.1) {
        const at = (beatTimes ? this.origin + beatTimes[this.next] : this.nextAt);
        if (audible && at >= this.context.currentTime) {
          const oscillator = this.context.createOscillator();
          const gain = this.context.createGain();
          oscillator.frequency.value = this.next % beatsPerBar === 0 ? 1000 : 700;
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(0.12, at + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);
          oscillator.connect(gain); gain.connect(this.output);
          oscillator.start(at); oscillator.stop(at + 0.05);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        }
        this.nextAt = at + 60 / this.tempo;
        this.next++;
      }
    };
    schedule();
    this.timer = setInterval(schedule, 25);
  }
  elapsed() { return Math.max(0, this.context.currentTime - this.origin); }
  running() { return this.context.state === 'running'; }
  stop() { this.closed = true; clearInterval(this.timer); void this.context.close().catch(() => {}); }
}

