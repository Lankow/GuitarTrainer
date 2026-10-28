/** Keep enough periods for low guitar notes at high device sample rates. */
export function fastFrameSize(sampleRate:number) {
 return Math.min(32768,Math.max(2048,2**Math.ceil(Math.log2(sampleRate*2048/48000))));
}
