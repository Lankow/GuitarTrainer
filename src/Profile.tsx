import { useState } from 'react';
const cookieName = 'guitartrainer_nickname';
function readNickname() {
  try {
    const value = document.cookie.split('; ').find(c => c.startsWith(`${cookieName}=`));
    const name = value ? decodeURIComponent(value.slice(cookieName.length + 1)).trim() : '';
    return name.length <= 30 ? name : '';
  } catch { return ''; }
}
export function useProfile() {
  const [nickname, setNickname] = useState(readNickname);
  const [warning, setWarning] = useState('');
  function save(name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 30) return;
    try {
      document.cookie = `${cookieName}=${encodeURIComponent(trimmed)}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      setWarning(readNickname() === trimmed ? '' : 'Cookies are unavailable. Your nickname will last for this session only.');
    } catch { setWarning('Cookies are unavailable. Your nickname will last for this session only.'); }
    setNickname(trimmed);
  }
  return { nickname, save, warning };
}
export function ProfileForm({ initial = '', onSave }: { initial?: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial);
  return <form className="profile-form" onSubmit={e => { e.preventDefault(); onSave(name); }}><label htmlFor="nickname">Nickname</label><input id="nickname" autoFocus autoComplete="nickname" value={name} maxLength={30} required onChange={e => setName(e.target.value)} placeholder="What should we call you?" /><p className="hint">Up to 30 characters. Saved in a cookie on this browser for one year.</p><button className="primary-button" disabled={!name.trim()} type="submit">{initial ? 'Save nickname' : 'Start practicing'}</button></form>;
}
