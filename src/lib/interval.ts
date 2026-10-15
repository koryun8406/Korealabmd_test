import { REFERENCE_INTERVALS, type RefInterval } from '../data/referenceIntervals';

export interface Query { analyteId: string; ageYears: number; sex: 'M' | 'F'; specimen?: string }

export interface Lookup {
  matches: RefInterval[];
  /** Why nothing matched (never extrapolated). */
  reason?: string;
  pediatric: boolean;
}

export function specimensFor(analyteId: string): string[] {
  return [...new Set(REFERENCE_INTERVALS.filter((r) => r.analyteId === analyteId).map((r) => r.specimen))];
}

export function lookupInterval(q: Query, data: RefInterval[] = REFERENCE_INTERVALS): Lookup {
  const forAnalyte = data.filter((r) => r.analyteId === q.analyteId);
  const pediatric = q.ageYears < 18;
  if (forAnalyte.length === 0) return { matches: [], pediatric, reason: '이 분석물에 대해 수록된 공표 참고구간이 없습니다 (자료 미확보).' };
  const matches = forAnalyte.filter(
    (r) => (r.sex === 'any' || r.sex === q.sex) && q.ageYears >= r.ageMin && q.ageYears < r.ageMax && (!q.specimen || r.specimen === q.specimen),
  );
  if (matches.length === 0) {
    const ranges = [...new Set(forAnalyte.map((r) => `${r.sex === 'any' ? '' : r.sex === 'M' ? '남 ' : '여 '}${r.ageMin}–${r.ageMax}세`))].join(', ');
    return { matches, pediatric, reason: `입력한 나이/성별/검체에 해당하는 공표 구간이 없습니다. 외삽하지 않습니다. (수록된 구간: ${ranges})` };
  }
  return { matches, pediatric };
}

export type Flag = 'low' | 'normal' | 'high';
export const judge = (value: number, r: Pick<RefInterval, 'low' | 'high'>): Flag =>
  value < r.low ? 'low' : value > r.high ? 'high' : 'normal';
