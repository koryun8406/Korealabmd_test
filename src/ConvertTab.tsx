import { useMemo, useState } from 'react';
import AnalytePicker from './AnalytePicker';
import { getAnalyte } from './data/analytes';
import { convert } from './lib/convert';

const fmt = (n: number) => (Math.abs(n) >= 1000 || Math.abs(n) < 0.001 ? n.toExponential(4) : Number(n.toPrecision(5)).toString());

export default function ConvertTab() {
  const [id, setId] = useState('glucose');
  const [val, setVal] = useState('100');
  const [from, setFrom] = useState('mg/dL');
  const [to, setTo] = useState('mmol/L');
  const [copied, setCopied] = useState(false);
  const a = getAnalyte(id)!;
  const res = useMemo(() => (val.trim() === '' ? null : convert(a, Number(val), from, to)), [a, val, from, to]);

  const pick = (nid: string) => {
    const n = getAnalyte(nid)!;
    setId(nid); setFrom(n.units[0]); setTo(n.units[1] ?? n.units[0]);
  };
  const copy = async () => {
    if (!res?.ok) return;
    try { await navigator.clipboard.writeText(`${fmt(res.value)} ${to}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  return (
    <section>
      <AnalytePicker value={id} onChange={pick} />
      <div className="row">
        <div className="field"><label>값</label><input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div className="field"><label>원본 단위</label><input list="units" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <button className="swap" title="양방향 스왑" onClick={() => { setFrom(to); setTo(from); if (res?.ok) setVal(String(Number(res.value.toPrecision(8)))); }}>⇄</button>
        <div className="field"><label>대상 단위</label><input list="units" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <datalist id="units">{a.units.map((u) => <option key={u} value={u} />)}</datalist>
      <small>UCUM 표기: 예) mg/dL, mmol/L, umol/L(µmol/L), meq/L, ug/dL, U/L, ukat/L</small>

      {res && (res.ok ? (
        <>
          <div className="result">
            <span className="big">{fmt(res.value)}</span> <span className="unit">{to}</span>
            <button onClick={copy}>{copied ? '복사됨 ✓' : '복사'}</button>
          </div>
          <div className="basis">
            <h3>계산 근거</h3>
            <dl>
              <dt>방법</dt><dd>{res.basis.method}</dd>
              <dt>계수</dt><dd>{res.basis.factor === null ? '비례 계수 없음(일차식, 아래 수식 참조)' : `${from} 1 = ${fmt(res.basis.factor)} ${to}`}</dd>
              <dt>수식</dt><dd><code>{res.basis.formula}</code></dd>
              <dt>가정</dt><dd>{res.basis.assumptions.length ? <ul>{res.basis.assumptions.map((s, i) => <li key={i}>{s}</li>)}</ul> : '특별한 가정 없음'}</dd>
              <dt>출처</dt><dd><ul>{res.basis.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul></dd>
            </dl>
          </div>
        </>
      ) : (
        <div className="refuse"><b>변환할 수 없습니다.</b><p>{res.reason}</p></div>
      ))}
    </section>
  );
}
