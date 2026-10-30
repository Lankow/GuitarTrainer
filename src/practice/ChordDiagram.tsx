import { tr } from '../i18n';
import { CHORDS } from './chords';
export function ChordDiagram({id}:{id:string}) {
 const chord=CHORDS.find(c=>c.id===id);if(!chord)return null;
 return <figure className="chord-diagram"><svg viewBox="0 0 200 210" role="img" aria-label={tr('Chord diagram: {0}',id)}>
 <title>{id}</title>
 {[0,1,2,3,4].map(i=><line key={`f${i}`} x1="30" x2="170" y1={40+i*32} y2={40+i*32} stroke="currentColor" strokeWidth={i===0?4:1}/>)}
 {chord.frets.map((fret,i)=><g key={i}><line x1={30+i*28} x2={30+i*28} y1="40" y2="168" stroke="currentColor" strokeWidth="1"/>{fret<=0?<text x={30+i*28} y="26" textAnchor="middle" fill="currentColor" fontSize="16">{fret===0?'○':'×'}</text>:<circle cx={30+i*28} cy={40+(fret-.5)*32} r="10" fill="currentColor"/>}<text x={30+i*28} y="192" textAnchor="middle" fill="currentColor" fontSize="12">{['E','A','D','G','B','E'][i]}</text></g>)}
 </svg><figcaption>{tr('Standard tuning · ○ open · × muted')}</figcaption></figure>;
}
