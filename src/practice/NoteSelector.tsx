import { tr } from '../i18n';
import { ALL_NOTES, NATURAL_NOTES, toggleAccidentals, selectedNoteName, type NoteSelection } from './noteSelection';
export function NoteSelector({ selection, onChange }: { selection: NoteSelection; onChange: (value: NoteSelection) => void }) {
  const choices = selection.sharps || selection.flats ? ALL_NOTES : NATURAL_NOTES;
  return <fieldset className="note-choices"><legend>{tr('Notes to practice')}</legend>
    <label className="note-sharps"><input type="checkbox" checked={selection.sharps} onChange={e => onChange(toggleAccidentals(selection, 'sharps', e.target.checked))} />{tr('Include sharps (C♯, D♯, F♯, G♯, A♯)')}</label>
    <label className="note-sharps"><input type="checkbox" checked={selection.flats ?? false} onChange={e => onChange(toggleAccidentals(selection, 'flats', e.target.checked))} />{tr('Include flats (D♭, E♭, G♭, A♭, B♭)')}</label>
    <p className="hint">{tr('Sharps and flats can name the same pitch. When both are enabled, equivalent names share one selection.')}</p>
    <div>{choices.map(n => <label className="note-tile" key={n}><input type="checkbox" aria-label={tr('Practice {0}', selectedNoteName(n, selection))} checked={selection.notes.includes(n)} onChange={e => onChange({ ...selection, notes: e.target.checked ? [...selection.notes, n] : selection.notes.filter(v => v !== n) })} /><strong>{selectedNoteName(n, selection)}</strong></label>)}</div>
    <div className="note-selection-actions"><button type="button" className="text-button" onClick={() => onChange({ ...selection, notes: [...choices] })}>{tr('Select all notes')}</button><button type="button" className="text-button" onClick={() => onChange({ ...selection, notes: [] })}>{tr('Deselect all notes')}</button></div>
    {!selection.notes.length && <p role="alert">{tr('Select at least one note to begin.')}</p>}
  </fieldset>;
}
