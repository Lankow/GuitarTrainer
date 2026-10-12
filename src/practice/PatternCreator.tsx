import { useState } from 'react';
import { patternLabel, validPattern, type FingerPattern } from './spiderPatterns';
export function PatternCreator({ onAdd }: { onAdd: (pattern: FingerPattern) => void }) {
  const [draft, setDraft] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  return <section className="spider-creator"><h3>Create a finger pattern</h3><p>Choose each finger once, in the order you want to play.</p>
    <div className="spider-finger-buttons">{[1, 2, 3, 4].map(finger => <button type="button" className="secondary-button" key={finger} disabled={draft.includes(finger)} onClick={() => { setDraft([...draft, finger]); setNotice(''); }}>{finger}</button>)}</div>
    <p className="spider-draft" aria-live="polite">{draft.length ? patternLabel(draft) : 'Choose your first finger'}{draft.length > 0 && draft.length < 4 ? ' – …' : ''}</p>
    <div className="practice-actions"><button type="button" className="secondary-button" disabled={!draft.length} onClick={() => { setDraft(draft.slice(0, -1)); setNotice(''); }}>Undo finger</button><button type="button" className="primary-button" disabled={!validPattern(draft)} onClick={() => { onAdd(draft); setNotice(`${patternLabel(draft)} is available in the pattern selectors.`); setDraft([]); }}>Add pattern</button></div>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
