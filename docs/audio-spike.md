# Audio experiment — first task

Status: planned, not performed. The goal is to evaluate detection and latency risks before expanding the application.

## Implementation scope

Minimal screen: microphone start/stop, note with octave, Hz, cents, signal level, and a state indicating no reliable reading. Handle permission denial, source disconnection, returning from the background, and microphone release when the session ends.

Web experiment: TypeScript, Web Audio, AudioWorklet. Before choosing a library/algorithm, check its license, computational cost, and access to samples. Compare at least an autocorrelation approach with YIN or MPM on the same data; record the choice in an ADR. Do not assume the largest FFT peak is the fundamental frequency.

## Proposed thresholds requiring measurement

- Range E2–E6, individual notes, no distortion.
- For stable portions of reference signals, at least 95% of analyzed frames must have an absolute error ≤ 10 cents; report missed detections and octave errors separately.
- For real guitar recordings, report correct note and octave, missed detections, and false detections. Reference pitch must come from an independent measurement, not solely from the expected fret's note name.
- Target latency from attack to a stable note in the UI: p95 ≤ 150 ms. This is a proposed quality target, not a promise or measured result.
- For 30 seconds of silence under test conditions: zero confirmed note events. Test ambient noise separately.

## Procedure

1. Signal tests: sine waves, harmonics with a weakened fundamental, silence, noise, and detuned notes; at least 44.1 and 48 kHz.
2. Physical guitar: open strings, several fretboard positions, quiet/loud plucks, decay, note transitions, and octave errors.
3. Minimum: physical Android/Chrome and iPhone/Safari devices. If native packaging is selected, repeat tests in installed builds; browser results do not establish WebView correctness.
4. Collect at least 30 attacks per configuration. Measure algorithm latency using sample timestamps; measure total latency independently, for example with a recording that captures the attack and screen change. Report the method's resolution, median, and p95.
5. Run continuously for 10 minutes and check responsiveness and stability. Document device and browser versions, input parameters, and microphone processing settings.

Do not confuse computation latency with total pipeline latency. Disabling noise suppression, automatic gain control, and echo cancellation is a request to the platform — report actual settings where available.

## Results log

| Date / device / OS / environment | Material / trial count | Accuracy / misses / octave errors | Median / p95 / method | Conclusion |
| --- | --- | --- | --- | --- |
| No measurements | — | — | — | Experiment has not started |

Without a physical device, that platform's result remains unverified. After the experiment: accept the stack, change the audio adapter, or explicitly revise the scope and thresholds.
