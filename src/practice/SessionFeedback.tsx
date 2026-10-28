import { tr } from '../i18n';
import { ROOTS } from './scales';
import { sessionFeedback } from './feedback';
export function SessionFeedback({sequence,hits,responses=[],exact=false,free=false,noteLabel}:{sequence:number[];hits:number[];responses?:number[];exact?:boolean;free?:boolean;noteLabel?:(note:number)=>string}) {
 const {rows,longest}=sessionFeedback(sequence,hits,exact);
 const label=(note:number)=>noteLabel?noteLabel(note):ROOTS[((note%12)+12)%12]+(exact?String(Math.floor(note/12)-1):'');
 const missed=rows.filter(r=>r.hits<r.attempts);
 return <section className="session-feedback"><h3>{tr('Session feedback')}</h3>
 {!free&&<><p>{tr('Longest correct streak: {0}',longest)}</p>{responses.length>0&&<p>{tr('Average response on correct notes: {0} ms',Math.round(responses.reduce((a,b)=>a+b,0)/responses.length))}</p>}
 <p>{tr(missed.length?'Focus next on: {0}':'All targets completed. Try a new selection when you feel ready.',missed.map(r=>label(r.note)).join(', '))}</p></>}
 {free&&<p>{tr('Completed at your own pace. No accuracy or speed rating is assigned.')}</p>}
 <div className="feedback-table"><table><thead><tr><th>{tr('Note')}</th><th>{tr(free?'Completed':'Correct / presented')}</th>{!free&&<th>{tr('Accuracy')}</th>}</tr></thead><tbody>{rows.map(row=><tr key={row.note}><th>{label(row.note)}</th><td>{free?row.hits:`${row.hits} / ${row.attempts}`}</td>{!free&&<td>{Math.round(row.hits/row.attempts*100)}%</td>}</tr>)}</tbody></table></div>
 </section>;
}
