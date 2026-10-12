import { useSyncExternalStore } from 'react';
import { DEFAULT_OPTIONS, validOptions, type Options } from './optionsSchema.ts';
let options=DEFAULT_OPTIONS;
try {const v=JSON.parse(localStorage.getItem('guitartrainer.options.v1')||'null');if(validOptions(v))options=v;}catch{/* Defaults remain usable. */}
const listeners=new Set<()=>void>();
let saved=true;
export function getOptions(){return options;}
export function updateOptions(patch:Partial<Options>){const next={...options,...patch};if(!validOptions(next))return;options=next;try{localStorage.setItem('guitartrainer.options.v1',JSON.stringify(next));saved=true;}catch{saved=false;}listeners.forEach(fn=>fn());}
export function useOptions(){const value=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>options);return [value,updateOptions,saved] as const;}
