import { useMemo, useState } from 'react';
import AnalytePicker from './AnalytePicker';
import { getAnalyte } from './data/analytes';
import { CALIPER } from './data/referenceIntervals';
import { judge, lookupInterval, specimensFor } from './lib/interval';
import { convert } from './lib/convert';

const LABEL = { low: '낮음 (Low)', normal: '정상 (Normal)', high: '높음 (High)' } as const;

export default function IntervalTab() {
  const [id, setId] = useState('creatinine');
  const [age, setAge] = useState('40');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [specimen, setSpecimen] = useState('');
  const [val, setVal] = useState('');
  const [unit, setUnit] = useState('');
  const a = getAnalyte(id)!;
  const specimens = specimensFor(id);
  const ageNum = Number(age);
  const lk = useMemo(
    () => (age.trim() === '' || !Number.isFinite(ageNum) || ageNum < 0 ? null : lookupInterval({ analyteId: id, ageYears: ageNum, sex, specimen: specimen || undefined })),
    [id, ageNum, age, sex, specimen],
  );

  return (
    <section>
      <AnalytePicker value={id} onChange={(n) => { setId(n); setSpecimen(''); setUnit(''); }} />
      <div className="row">
        <div className="field"><label>나이 (세)</label><input inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} /></div>
        <div className="field"><label>성별</label>
          <select value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F')}><option value="M">남</option><option value="F">여</option></select></div>
        <div className="field"><label>검체</label>
          <select value={specimen} onChange={(e) => setSpecimen(e.target.value)}>
            <option value="">(전체)</option>
            {specimens.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></div>
      </div>

      {lk?.pediatric && (
        <div className="note">소아(18세 미만)는 <a href={CALIPER.url} target="_blank" rel="noreferrer">{CALIPER.label}</a>의 연령·성별 구간을 참고하세요. 이 앱은 CALIPER 수치를 수록하지 않습니다.</div>
      )}
      {lk && lk.matches.length === 0 && <div className="refuse"><b>공표된 구간 없음</b><p>{lk.reason}</p></div>}
      {lk?.matches.map((r, i) => {
        const u = unit || r.unit;
        const conv = val.trim() !== '' && u !== r.unit ? convert(a, Number(val), u, r.unit) : null;
        const x = val.trim() === '' ? null : conv ? (conv.ok ? conv.value : null) : Number(val);
        const flag = x !== null && Number.isFinite(x) ? judge(x, r) : null;
        return (
          <div className="card" key={i}>
            <div className="big">{r.low} – {r.high} <span className="unit">{r.unit}</span></div>
            <ul>
              <li>검체: {r.specimen}</li>
              <li>나이 구간: {r.ageMin} 이상 ~ {r.ageMax} 미만 (세) · 성별: {r.sex === 'any' ? '공통' : r.sex === 'M' ? '남' : '여'}</li>
              <li>출처: <a href={r.sourceUrl} target="_blank" rel="noreferrer">{r.source}</a></li>
              {!r.verified && <li className="warn">⚠ 원문 대조 미완료 — TODO(verify)</li>}
              {r.note && <li>{r.note}</li>}
            </ul>
            <div className="row">
              <div className="field"><label>결과 값</label><input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></div>
              <div className="field"><label>단위</label><input list="iunits" value={unit || r.unit} onChange={(e) => setUnit(e.target.value)} /></div>
            </div>
            <datalist id="iunits">{a.units.map((x2) => <option key={x2} value={x2} />)}</datalist>
            {conv && !conv.ok && <div className="refuse"><p>{conv.reason}</p></div>}
            {conv?.ok && <small>{val} {u} = {Number(conv.value.toPrecision(5))} {r.unit} 로 환산하여 판정</small>}
            {flag && <div className={`flag ${flag}`}>{LABEL[flag]}</div>}
          </div>
        );
      })}
    </section>
  );
}
