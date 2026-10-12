import { tr } from './i18n';
import { useRef, useState } from 'react';
import { browserStore, collectBackup, MAX_BACKUP_BYTES, parseBackup, restoreBackup, type Backup } from './backup';
export function BackupSettings({ stopAudio, preferences, nickname }: { stopAudio: () => void; preferences: unknown; nickname: string }) {
  const [pending,setPending]=useState<Backup|null>(null), [message,setMessage]=useState(''), [reading,setReading]=useState(false);
  const input=useRef<HTMLInputElement>(null);
  function exportFile() {
    try {
      const store=browserStore();
      const backup=collectBackup({...store,get:key=>key==='guitartrainer.preferences.v1'?JSON.stringify(preferences):store.get(key),getCookie:key=>key==='guitartrainer_nickname'?nickname:store.getCookie(key)});
      const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
      const link=document.createElement('a'); link.href=url; link.download=`guitartrainer-backup-${new Date().toISOString().slice(0,10)}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),30000);
      setMessage('Backup download requested. Keep the JSON file to restore your setup later.');
    } catch(cause) { setMessage(cause instanceof Error?cause.message:'Could not export settings.'); }
  }
  async function read(file?:File) {
    setPending(null); setMessage(''); if(!file)return; setReading(true);
    try { if(file.size>MAX_BACKUP_BYTES)throw new Error('Backup is too large (maximum 256 KB).'); setPending(parseBackup(await file.text())); }
    catch(cause) { setMessage(cause instanceof Error?cause.message:'Could not read file.'); }
    finally { setReading(false); if(input.current)input.current.value=''; }
  }
  function apply() {
    if(!pending)return;
    try { stopAudio(); restoreBackup(pending,browserStore()); window.location.reload(); }
    catch(cause) { setMessage(cause instanceof Error?cause.message:'Import failed.'); setPending(null); }
  }
  return <section className="panel practice-config backup-panel"><div className="eyebrow">{tr("TAKE YOUR SETUP WITH YOU")}</div><h2>{tr("Backup & restore")}</h2><p>{tr("Export your appearance, audio preferences, nickname, high scores, Note Practice and Scale Practice setups, and Spider Walk routines and custom patterns.")}</p><p>{tr("Files stay on your device. Microphone permissions and active sessions are not included. On another device, you may need to choose a different microphone.")}</p>
    <div className="practice-actions"><button className="primary-button" onClick={exportFile}>{tr("Export settings")}</button><button className="secondary-button" disabled={reading} onClick={()=>input.current?.click()}>{reading?tr("Reading file…"):tr("Import settings")}</button></div>
    <input ref={input} type="file" accept=".json,application/json" hidden aria-label={tr("Settings backup file")} onChange={e=>void read(e.target.files?.[0])}/>
    {pending&&<div className="help-panel"><h3>{tr("Ready to restore")}</h3><p>{tr("Backup from")} {new Date(pending.exportedAt).toLocaleString()} {tr(". Profile:")} {pending.cookies.guitartrainer_nickname??'No saved nickname'}.</p><p>{tr("This replaces your saved settings, routines, custom patterns, profile and high scores with the file’s contents. Audio stops and the app reloads. Export your current settings first if you want to keep them.")}</p><div className="practice-actions"><button className="primary-button" onClick={apply}>{tr("Replace settings & reload")}</button><button className="secondary-button" onClick={()=>setPending(null)}>{tr("Cancel import")}</button></div></div>}
    {message&&<p role="status">{tr(message)}</p>}
  </section>;
}
