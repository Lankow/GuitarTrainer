import { getOptions, useOptions } from './options';
import { translate } from './translation';
export function tr(key:string,...values:unknown[]){return translate(getOptions().language,key,...values);}
export function LanguageSettings(){
 const [options,update,saved]=useOptions();
 const names={en:'English',pl:'Polski',es:'Español'};
 return <div className="language-switcher" role="group" aria-label={tr('Language')}>
  <div className="language-buttons">{(['en','pl','es'] as const).map(language=><button key={language} type="button" className="language-button" aria-label={names[language]} title={names[language]} aria-pressed={options.language===language} onClick={()=>update({language})}>
   <svg viewBox="0 0 60 40" width="30" height="20" aria-hidden="true" focusable="false">
    {language==='es'?<><path fill="#aa151b" d="M0 0h60v40H0z"/><path fill="#f1bf00" d="M0 10h60v20H0z"/></>:language==='pl'?<><path fill="#fff" d="M0 0h60v20H0z"/><path fill="#dc143c" d="M0 20h60v20H0z"/></>:<><path fill="#012169" d="M0 0h60v40H0z"/><path stroke="#fff" strokeWidth="8" d="m0 0 60 40M60 0 0 40"/><path stroke="#c8102e" strokeWidth="3" d="m0 0 60 40M60 0 0 40"/><path stroke="#fff" strokeWidth="13" d="M30 0v40M0 20h60"/><path stroke="#c8102e" strokeWidth="7" d="M30 0v40M0 20h60"/></>}
   </svg>
  </button>)}</div>
  {!saved&&<p role="status">{tr('Settings could not be saved in this browser.')}</p>}
 </div>;
}
