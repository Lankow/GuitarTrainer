import { useState } from 'react';
import { tr } from '../i18n';
import { SpiderFretboard } from './SpiderFretboard';
import { validSpiderPattern, type SpiderPattern, type SpiderRecord, type FretPosition } from './spiderLibrary';
export function SpiderCreator({initial,onSave,onCancel}:{initial?:SpiderPattern;onSave:(p:SpiderPattern)=>void;onCancel:()=>void}) {
 const [name,setName]=useState(initial?.name??''),[frets,setFrets]=useState(initial?.frets??12),[records,setRecords]=useState<SpiderRecord[]>(initial?.records??[]);
 const [count,setCount]=useState(4),[repetitions,setRepetitions]=useState(2),[notes,setNotes]=useState<FretPosition[]>([]),[editing,setEditing]=useState<number|null>(null);
 const validCount=Number.isInteger(count)&&count>=1&&count<=64;
 const recordValid=validCount&&notes.length===count&&Number.isInteger(repetitions)&&repetitions>=1&&repetitions<=100;
 const pattern={id:initial?.id??'new-walk',name:name.trim(),frets,records};
 function commitRecord(){if(!recordValid)return;const record={notes,repetitions};setRecords(r=>editing===null?[...r,record]:r.map((v,i)=>i===editing?record:v));setNotes([]);setEditing(null);}
 return <section className="panel practice-config spider-creator"><h2>{tr('Spider Walk Creator')}</h2>
 <label>{tr('Pattern name')}<input maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>{tr('Number of frets')}<input type="number" min={1} max={24} value={frets||''} onChange={e=>{const n=Number(e.target.value);if(records.some(r=>r.notes.some(p=>p.fret>n))||notes.some(p=>p.fret>n))return;setFrets(n);}}/></label>
 <p>{tr('The first note locks the record to one string. Add another record to change strings. Undo all notes to choose a different string. Use the arrows to move along the frets.')}</p>
 <div className="creator-record-settings"><label>{tr('Number of notes')}<input type="number" min={1} max={64} value={count||''} onChange={e=>{setCount(Number(e.target.value));setNotes([]);}}/></label><label>{tr('Repetitions')}<input type="number" min={1} max={100} value={repetitions||''} onChange={e=>setRepetitions(Number(e.target.value))}/></label></div>
 {Number.isInteger(frets)&&frets>=1&&frets<=24&&<SpiderFretboard hideStringLabels frets={frets} notes={notes} lockedString={notes[0]?.string} onPick={validCount&&notes.length<count?n=>setNotes(v=>v.length&&v[0].string!==n.string?v:[...v,n]):undefined}/>}
 <p>{notes.length} / {count||'—'} · {notes.map(n=>`S${n.string}:${n.fret}`).join(' → ')}</p>
 <div className="practice-actions"><button className="text-button" disabled={!notes.length} onClick={()=>setNotes(n=>n.slice(0,-1))}>{tr('Undo last note')}</button><button className="secondary-button" disabled={!recordValid||(editing===null&&records.length>=32)} onClick={commitRecord}>{tr(editing===null?'Add record':'Update record')}</button></div>
 <ol className="spider-summary">{records.map((r,i)=><li key={i}><span>{i+1}. {r.notes.map(n=>`S${n.string}:${n.fret}`).join(' → ')} × {r.repetitions}</span><div className="practice-actions"><button className="text-button" onClick={()=>{setEditing(i);setNotes(r.notes);setCount(r.notes.length);setRepetitions(r.repetitions);}}>{tr('Edit')}</button><button className="text-button" onClick={()=>{setRecords(v=>v.filter((_,index)=>index!==i));setEditing(null);setNotes([]);}}>{tr('Remove')}</button></div></li>)}</ol>
 <p>{tr('Add each record before saving. Records play from top to bottom; each repeats before the next begins.')}</p>
 <div className="practice-actions"><button className="primary-button" disabled={!validSpiderPattern(pattern)||notes.length>0} onClick={()=>onSave({...pattern,id:initial?.id??crypto.randomUUID()})}>{tr('Save Spider Walk')}</button><button className="secondary-button" onClick={onCancel}>{tr('Cancel')}</button></div>
 </section>;
}
