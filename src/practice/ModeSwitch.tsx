import { useId } from 'react';
import { tr } from '../i18n';

export function ModeSwitch({ free, onChange }: { free: boolean; onChange: (free: boolean) => void }) {
  const name = useId();
  return <fieldset className="practice-mode" aria-label={tr('Practice mode')}>
    <div className="mode-switch">
      {[false, true].map(value => <label key={String(value)} className="mode-option">
        <input type="radio" name={name} checked={free === value} onChange={() => onChange(value)} />
        <span>{tr(value ? 'Free mode' : 'Timed mode')}</span>
      </label>)}
    </div>
  </fieldset>;
}
