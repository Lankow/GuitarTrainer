import { detectChord } from './chordDetection';
self.onmessage=(event:MessageEvent<{samples:Float32Array;sampleRate:number;gate:number;reference:number}>)=>{
 const {samples,sampleRate,gate,reference}=event.data;const start=performance.now();
 self.postMessage({pitch:null,chord:detectChord(samples,sampleRate,gate,reference),computationMs:performance.now()-start});
};
