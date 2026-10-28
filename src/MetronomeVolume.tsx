import { useId } from 'react';
import { useOptions } from './options';
import { tr } from './i18n';

export function MetronomeVolume() {
 const [options,update,saved]=useOptions();
 const id=useId(), volume=options.metronomeVolume??100;
 return <div className="metronome-volume"><label htmlFor={id}>{tr('Metronome volume')} · {volume}%</label>
 <input id={id} type="range" min={0} max={100} step={1} value={volume} aria-valuetext={volume===0?tr('Muted'):`${volume}%`} onChange={e=>update({metronomeVolume:Number(e.target.value)})}/>
 <p className="hint">{tr('Applies to metronome and Spider Walk clicks. Set to 0% to mute.')}</p>
 {!saved&&<p role="status">{tr('Settings could not be saved in this browser.')}</p>}</div>;
}
