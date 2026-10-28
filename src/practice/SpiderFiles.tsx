import { useRef, useState } from 'react';
import { tr } from '../i18n';
import { exportSpiderPatterns, parseSpiderPatterns, type SpiderPattern } from './spiderLibrary';
export function SpiderFiles({patterns,onImport}:{patterns:SpiderPattern[];onImport:(patterns:SpiderPattern[])=>boolean}) {
 const [selected,setSelected]=useState<string[]>([]),[pending,setPending]=useState<SpiderPattern[]|null>(null),[message,setMessage]=useState(''),[reading,setReading]=useState(false);
 const exportDialog=useRef<HTMLDialogElement>(null);
 const fileInput=useRef<HTMLInputElement>(null);
 function download(){try{const text=exportSpiderPatterns(patterns.filter(p=>selected.includes(p.id)));const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='guitartrainer-spider-walks.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setMessage('Spider Walk download requested.');exportDialog.current?.close();}catch{setMessage('Could not export Spider Walks.');}}
 async function read(file?:File){if(!file)return;setReading(true);setMessage('');setPending(null);try{if(file.size>256*1024)throw new Error();setPending(parseSpiderPatterns(await file.text()));}catch{setMessage('Invalid Spider Walk file.');}finally{setReading(false);if(fileInput.current)fileInput.current.value='';}}
 return <section className="panel practice-config spider-files"><h2>{tr('Import / export Spider Walks')}</h2><p>{tr('Select the walks to export. Imports add copies and never replace existing walks.')}</p>
 <div className="practice-actions"><button className="secondary-button" disabled={!patterns.length} onClick={()=>exportDialog.current?.showModal()}>{tr('Export walks')}</button><button className="secondary-button" disabled={reading} onClick={()=>fileInput.current?.click()}>{tr('Import Spider Walks')}</button></div>
 <dialog ref={exportDialog} className="panel practice-config spider-export-dialog" aria-labelledby="spider-export-title"><h2 id="spider-export-title">{tr('Export walks')}</h2><div className="spider-export-list">{patterns.map(p=><label className="spider-export-choice" key={p.id}><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,p.id]:s.filter(id=>id!==p.id))}/>{p.name}</label>)}</div><div className="practice-actions"><button className="primary-button" disabled={!patterns.some(p=>selected.includes(p.id))} onClick={download}>{tr('Export selected walks')}</button><button className="secondary-button" onClick={()=>exportDialog.current?.close()}>{tr('Cancel')}</button></div></dialog>

 <input hidden style={{display:'none'}} ref={fileInput} type="file" accept=".json,application/json" aria-label={tr('Spider Walk file')} onChange={e=>void read(e.target.files?.[0])}/>
 {pending&&<div className="help-panel"><p>{pending.map(p=>p.name).join(', ')}</p><div className="practice-actions"><button className="primary-button" onClick={()=>{if(onImport(pending)){setPending(null);setMessage('Spider Walks imported.');}}}>{tr('Add imported walks')}</button><button className="secondary-button" onClick={()=>setPending(null)}>{tr('Cancel import')}</button></div></div>}
 {message&&<p role="status">{tr(message)}</p>}
 </section>;
}
