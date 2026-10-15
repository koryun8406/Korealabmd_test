import { useState } from 'react';
import ConvertTab from './ConvertTab';
import IntervalTab from './IntervalTab';

export default function App() {
  const [tab, setTab] = useState<'convert' | 'interval'>('convert');
  return (
    <main>
      <h1>임상검사 단위 변환 · 참고구간</h1>
      <nav>
        <button className={tab === 'convert' ? 'on' : ''} onClick={() => setTab('convert')}>변환</button>
        <button className={tab === 'interval' ? 'on' : ''} onClick={() => setTab('interval')}>참고구간</button>
      </nav>
      {tab === 'convert' ? <ConvertTab /> : <IntervalTab />}
      <footer>교육·참고용입니다. 임상 판단은 각 검사실의 방법·참고구간을 따르세요.</footer>
    </main>
  );
}
