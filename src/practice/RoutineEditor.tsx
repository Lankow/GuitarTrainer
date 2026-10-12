import { tr } from '../i18n';
import { PatternCreator } from './PatternCreator';
import { addPattern, patternLabel, type FingerPattern } from './spiderPatterns';
import { newBlock, type WalkBlock, type WalkSetup } from './spiderRoutine';
function PatternSelect({ label, value, patterns, change }: { label: string; value: FingerPattern; patterns: FingerPattern[]; change: (value: FingerPattern) => void }) {
  const options = addPattern(patterns, value);
  return <label className="spider-pattern-select">{tr(label)}<select value={value.join('')} onChange={e => change(e.target.value.split('').map(Number))}>{options.map(p => <option key={p.join('')} value={p.join('')}>{patternLabel(p)}</option>)}</select></label>;
}
export function RoutineEditor({ setup, change }: { setup: WalkSetup; change: (patch: Partial<WalkSetup>) => void }) {
  function updateBlock(index: number, patch: Partial<WalkBlock>) { change({ blocks: setup.blocks.map((b, i) => i === index ? { ...b, ...patch } : b) }); }
  function move(index: number, offset: number) { const blocks = [...setup.blocks]; [blocks[index], blocks[index + offset]] = [blocks[index + offset], blocks[index]]; change({ blocks }); }
  return <section className="panel practice-config spider-routine"><div className="eyebrow">{tr("PATTERN PLAYLIST")}</div><h2>{tr("Build your routine")}</h2><p>{tr("Blocks play automatically in order. Each repetition crosses all six strings, plus the return journey if enabled.")}</p>
    {setup.blocks.map((block, index) => <fieldset className="spider-block" key={index}><legend>{tr("Block")} {index + 1}</legend>
      <PatternSelect label={tr('Block {0} pattern', index + 1)} value={block.pattern} patterns={setup.patterns} change={pattern => updateBlock(index, { pattern, strings: block.mixed ? block.strings : Array.from({ length: 6 }, () => [...pattern]) })}/>
      <label>{tr("Block")} {index + 1} {tr("repetitions")}<input type="number" min={1} max={20} required value={block.repetitions || ''} onChange={e => updateBlock(index, { repetitions: Number(e.target.value) })}/></label>
      <label className="spider-toggle"><input type="checkbox" checked={block.mixed} onChange={e => updateBlock(index, { mixed: e.target.checked })}/>{tr("Mix patterns by string in block")} {index + 1}</label>
      {block.mixed && <div className="spider-string-patterns">{block.strings.map((pattern, stringIndex) => <PatternSelect key={stringIndex} label={tr('Block {0}, string {1}', index + 1, 6 - stringIndex)} value={pattern} patterns={setup.patterns} change={p => updateBlock(index, { strings: block.strings.map((v, i) => i === stringIndex ? p : v) })}/>)}</div>}
      <div className="spider-block-actions"><button type="button" className="text-button" disabled={index === 0} aria-label={tr("Move block {0} up", index + 1)} onClick={() => move(index, -1)}>{tr("Move up")}</button><button type="button" className="text-button" disabled={index === setup.blocks.length - 1} aria-label={tr("Move block {0} down", index + 1)} onClick={() => move(index, 1)}>{tr("Move down")}</button><button type="button" className="text-button" disabled={setup.blocks.length === 1} aria-label={tr("Remove block {0}", index + 1)} onClick={() => change({ blocks: setup.blocks.filter((_, i) => i !== index) })}>{tr("Remove")}</button></div>
    </fieldset>)}
    <button type="button" className="secondary-button" disabled={setup.blocks.length >= 8} onClick={() => change({ blocks: [...setup.blocks, newBlock([2, 3, 4, 1])] })}>{tr("Add block")}</button>
    <PatternCreator onAdd={p => change({ patterns: addPattern(setup.patterns, p) })}/>
  </section>;
}
