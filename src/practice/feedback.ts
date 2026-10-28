export function sessionFeedback(sequence:number[],hits:number[],exact=false) {
 const accepted=new Set(hits), rows=new Map<number,{note:number;attempts:number;hits:number}>();
 let streak=0,longest=0;
 sequence.forEach((midi,index)=>{const note=exact?midi:((midi%12)+12)%12;const row=rows.get(note)??{note,attempts:0,hits:0};row.attempts++;if(accepted.has(index)){row.hits++;longest=Math.max(longest,++streak);}else streak=0;rows.set(note,row);});
 return {rows:[...rows.values()].sort((a,b)=>(b.attempts-b.hits)-(a.attempts-a.hits)||a.note-b.note),longest};
}
