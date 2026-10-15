import { useState } from 'react';
import { findAnalytes, getAnalyte } from './data/analytes';

export default function AnalytePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('');
  const list = findAnalytes(q);
  const cur = getAnalyte(value);
  return (
    <div className="field">
      <label>분석물 검색 (영문·한글·동의어)</label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="예: glucose, 혈당, sgpt, BUN" />
      <select value={list.some((a) => a.id === value) ? value : ''} onChange={(e) => onChange(e.target.value)} size={Math.min(6, Math.max(2, list.length))}>
        {list.length === 0 && <option disabled>검색 결과 없음</option>}
        {list.map((a) => (
          <option key={a.id} value={a.id}>{a.ko} · {a.en}</option>
        ))}
      </select>
      {cur && <small>선택: <b>{cur.ko}</b> ({cur.en})</small>}
    </div>
  );
}
