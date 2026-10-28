import { validSpiderLibrary } from './practice/spiderLibrary.ts';
import { readSelection } from './practice/noteSelection.ts';
import { validOptions } from './optionsSchema.ts';
import { validFree } from './practice/freeSetup.ts';
import { TUNINGS } from './audio/tunings.ts';
import { validConfig, type PracticeConfig } from './practice/engine.ts';
import { SCALES } from './practice/scales.ts';
import { validSpider } from './practice/spider.ts';
import { validWalk } from './practice/spiderRoutine.ts';
export const STORAGE_KEYS = ['guitartrainer.preferences.v1', 'guitartrainer.practice.v1', 'guitartrainer.practice.notes.v1', 'guitartrainer.scales.v1', 'guitartrainer.spider.v1', 'guitartrainer.spider.v2', 'guitartrainer.options.v1', 'guitartrainer.free.v1', 'guitartrainer.spider.library.v1'] as const;
export const COOKIE_KEYS = ['guitartrainer_nickname', 'guitartrainer_scores_v1'] as const;
export const MAX_BACKUP_BYTES = 256 * 1024;
export type Backup = { format: 'GuitarTrainer backup'; version: 1; exportedAt: string; storage: Record<string, unknown>; cookies: Record<string, string | null> };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
function validEntry(key: string, value: unknown) {
  if (value === null) return true;
  if (!object(value)) return false;
  const v = value;
  switch (key) {
    case 'guitartrainer.options.v1': return validOptions(v);
    case 'guitartrainer.free.v1': return validFree(v);
    case 'guitartrainer.preferences.v1': return typeof v.device === 'string' && v.device.length <= 2048 && integer(v.gate,-70,-30) && [432,440,442].includes(v.reference as number) && typeof v.color === 'string' && /^#[0-9a-f]{6}$/i.test(v.color) && TUNINGS.some(t=>t.id===v.tuning);
    case 'guitartrainer.practice.v1': return validConfig(v as PracticeConfig);
    case 'guitartrainer.practice.notes.v1': return !!readSelection(v);
    case 'guitartrainer.scales.v1': return (v.returnToRoot===undefined||typeof v.returnToRoot==='boolean') && validConfig(v as PracticeConfig) && integer(v.root,0,11) && SCALES.some(s=>s.id===v.scale) && ['random','ordered'].includes(v.mode as string) && integer(v.repetitions,1,100);
    case 'guitartrainer.spider.v1': return validSpider(v);
    case 'guitartrainer.spider.library.v1': return validSpiderLibrary(v);
    case 'guitartrainer.spider.v2': return validWalk(v);
    default: return false;
  }
}
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('Backup is too large (maximum 256 KB).');
  let data: unknown;
  try { data=JSON.parse(text); } catch { throw new Error('Choose a valid GuitarTrainer JSON backup.'); }
  if (!object(data) || data.format !== 'GuitarTrainer backup' || data.version !== 1 || typeof data.exportedAt !== 'string' || !Number.isFinite(Date.parse(data.exportedAt)) || !object(data.storage) || !object(data.cookies)) throw new Error('Unsupported or invalid backup format.');
  for (const key of ['guitartrainer.options.v1', 'guitartrainer.free.v1', 'guitartrainer.spider.library.v1']) if (!Object.hasOwn(data.storage,key)) data.storage[key]=null;
  if (Object.keys(data.storage).length !== STORAGE_KEYS.length || Object.keys(data.cookies).length !== COOKIE_KEYS.length) throw new Error('Backup contains missing or unsupported sections.');
  for (const key of STORAGE_KEYS) if (!Object.hasOwn(data.storage,key) || !validEntry(key,data.storage[key])) throw new Error(`Invalid settings section: ${key}.`);
  for (const key of COOKIE_KEYS) if (!Object.hasOwn(data.cookies,key)) throw new Error('Backup is missing profile or scores.');
  const name=data.cookies.guitartrainer_nickname;
  if (name !== null && (typeof name !== 'string' || !name.trim() || name.length>30)) throw new Error('Invalid nickname.');
  const scores=data.cookies.guitartrainer_scores_v1;
  if (scores !== null) {
    if (typeof scores !== 'string' || encodeURIComponent(scores).length>3500) throw new Error('Invalid high scores.');
    let list: unknown; try { list=JSON.parse(scores); } catch { throw new Error('Invalid high scores.'); }
    if (!Array.isArray(list) || list.length>12 || !list.every(r=>object(r) && typeof r.key==='string' && r.key.length<100 && integer(r.score,0,100))) throw new Error('Invalid high scores.');
  }
  return data as Backup;
}
export type BackupStore = { get: (key: string) => string | null; set: (key: string, value: string | null) => void; getCookie: (key: string) => string | null; setCookie: (key: string, value: string | null) => void };
export function collectBackup(store: BackupStore): Backup {
  const storage=Object.fromEntries(STORAGE_KEYS.map(key=>{ const raw=store.get(key); return [key,raw===null?null:JSON.parse(raw)]; }));
  const cookies=Object.fromEntries(COOKIE_KEYS.map(key=>[key,store.getCookie(key)]));
  return parseBackup(JSON.stringify({format:'GuitarTrainer backup',version:1,exportedAt:new Date().toISOString(),storage,cookies}));
}
export function restoreBackup(input: Backup, store: BackupStore) {
  const data=parseBackup(JSON.stringify(input));
  const oldStorage=STORAGE_KEYS.map(k=>[k,store.get(k)] as const), oldCookies=COOKIE_KEYS.map(k=>[k,store.getCookie(k)] as const);
  const write=(key:string,value:string|null,cookie=false)=> { if(cookie) store.setCookie(key,value); else store.set(key,value); if((cookie?store.getCookie(key):store.get(key))!==value) throw new Error('Browser storage did not accept the imported data.'); };
  try {
    for(const key of STORAGE_KEYS) write(key,data.storage[key]===null?null:JSON.stringify(data.storage[key]));
    for(const key of COOKIE_KEYS) write(key,data.cookies[key],true);
  } catch {
    let restored=true;
    for(const [key,value] of oldStorage) try { write(key,value); } catch { restored=false; }
    for(const [key,value] of oldCookies) try { write(key,value,true); } catch { restored=false; }
    throw new Error(restored?'Import failed. Your previous settings were restored.':'Import failed and some previous values could not be restored. Keep your backup and check browser storage permissions.');
  }
}
export function browserStore(): BackupStore {
  return {
    get:key=>localStorage.getItem(key), set:(key,value)=>value===null?localStorage.removeItem(key):localStorage.setItem(key,value),
    getCookie:key=>{ const item=document.cookie.split('; ').find(c=>c.startsWith(key+'=')); return item?decodeURIComponent(item.slice(key.length+1)):null; },
    setCookie:(key,value)=>{ document.cookie=`${key}=${encodeURIComponent(value??'')}; Max-Age=${value===null?0:31536000}; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`; },
  };
}
