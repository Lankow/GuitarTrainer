import { getOptions, useOptions } from './options';
import { translate } from './translation';
export function tr(key:string,...values:unknown[]){return translate(getOptions().language,key,...values);}
export function LanguageSettings(){const [options,update,saved]=useOptions();return <section className="panel practice-config language-panel"><label htmlFor="language">{tr('Language')}</label><select id="language" value={options.language} onChange={e=>update({language:e.target.value as 'en'|'pl'})}><option value="en">English</option><option value="pl">Polski</option></select>{!saved&&<p role="status">{tr('Settings could not be saved in this browser.')}</p>}</section>;}
