import { describe, it, expect } from 'vitest';
import { convert } from '../lib/convert';
import { getAnalyte, ANALYTES, findAnalytes } from '../data/analytes';
import { molarMass } from '../lib/molarMass';
import { lookupInterval, judge } from '../lib/interval';
import { REFERENCE_INTERVALS } from '../data/referenceIntervals';

const run = (id: string, v: number, from: string, to: string) => convert(getAnalyte(id)!, v, from, to);
const val = (id: string, v: number, from: string, to: string) => {
  const r = run(id, v, from, to);
  if (!r.ok) throw new Error(r.reason);
  return r.value;
};

// TODO(verify): Labcorp SI table / CMEinfo PDF / NBME PDF were unreachable (network blocked). The "published"
// factors below are the widely cited conventional SI factors recalled from memory, NOT copied from those three
// documents. Replace with a direct comparison once the documents are accessible.
// Tolerance 0.5 % because published tables round factors to 3-4 significant digits.
const PUBLISHED: [string, string, string, number][] = [
  ['glucose', 'mg/dL', 'mmol/L', 0.0555],
  ['cholesterol', 'mg/dL', 'mmol/L', 0.0259],
  ['triglyceride', 'mg/dL', 'mmol/L', 0.0113],
  ['creatinine', 'mg/dL', 'umol/L', 88.4],
  ['urate', 'mg/dL', 'umol/L', 59.48],
  ['calcium', 'mg/dL', 'mmol/L', 0.2495],
  ['magnesium', 'mg/dL', 'mmol/L', 0.4114],
  ['bilirubin', 'mg/dL', 'umol/L', 17.1],
  ['bun', 'mg/dL', 'mmol/L', 0.357],
  ['phosphate', 'mg/dL', 'mmol/L', 0.3229],
  ['iron', 'ug/dL', 'umol/L', 0.1791],
  ['lactate', 'mg/dL', 'mmol/L', 0.111],
  ['albumin', 'g/dL', 'g/L', 10],
  ['calcium', 'mg/dL', 'meq/L', 0.499],
];

describe('molar mass from atomic weights', () => {
  it('glucose ≈ 180.16', () => expect(molarMass('C6H12O6').value).toBeCloseTo(180.156, 2));
  it('rejects unknown element', () => expect(() => molarMass('Xx2')).toThrow());
});

describe('computed factors agree with conventional published factors (±0.5%)', () => {
  it.each(PUBLISHED)('%s %s→%s ≈ %f', (id, from, to, factor) => {
    expect(val(id, 1, from, to) / factor).toBeGreaterThan(0.995);
    expect(val(id, 1, from, to) / factor).toBeLessThan(1.005);
  });
});

describe('UCUM scaling and electrolytes', () => {
  it('Na 140 mmol/L = 140 mEq/L', () => expect(val('sodium', 140, 'mmol/L', 'meq/L')).toBeCloseTo(140, 6));
  it('K 4 mmol/L → mg/dL ≈ 15.64', () => expect(val('potassium', 4, 'mmol/L', 'mg/dL')).toBeCloseTo(15.64, 1));
  it('Ca 2.4 mmol/L = 4.8 mEq/L', () => expect(val('calcium', 2.4, 'mmol/L', 'meq/L')).toBeCloseTo(4.8, 6));
  it('U/L ↔ µkat/L: 60 U/L = 1 µkat/L', () => expect(val('alt', 60, 'U/L', 'ukat/L')).toBeCloseTo(1, 6));
  it('round trip glucose', () => expect(val('glucose', val('glucose', 100, 'mg/dL', 'mmol/L'), 'mmol/L', 'mg/dL')).toBeCloseTo(100, 6));
});

describe('special conversions', () => {
  it('HbA1c 6.5% ≈ 48 mmol/mol (NGSP→IFCC)', () => expect(val('hba1c', 6.5, '%', 'mmol/mol')).toBeCloseTo(47.6, 0));
  it('HbA1c 48 mmol/mol ≈ 6.5% (IFCC→NGSP)', () => expect(val('hba1c', 48, 'mmol/mol', '%')).toBeCloseTo(6.54, 1));
  it('HbA1c round trip within 0.02 %', () => expect(Math.abs(val('hba1c', val('hba1c', 7, '%', 'mmol/mol'), 'mmol/mol', '%') - 7)).toBeLessThan(0.02));
  it('uACR 30 mg/g ≈ 3.4 mg/mmol (creatinine MW 113.12)', () => expect(val('uacr', 30, 'mg/g', 'mg/mmol')).toBeCloseTo(3.39, 1));
  it('uPCR 150 mg/g ≈ 17 mg/mmol; round trip', () => {
    const x = val('upcr', 150, 'mg/g', 'mg/mmol');
    expect(x).toBeCloseTo(16.97, 1);
    expect(val('upcr', x, 'mg/mmol', 'mg/g')).toBeCloseTo(150, 6);
  });
  it('BUN 14 mg/dL ≈ 5.0 mmol/L urea', () => expect(val('bun', 14, 'mg/dL', 'mmol/L')).toBeCloseTo(5.0, 1));
  it('urea 60 mg/dL ≈ 10 mmol/L', () => expect(val('urea', 60, 'mg/dL', 'mmol/L')).toBeCloseTo(9.99, 1));
  it('TG 150 mg/dL ≈ 1.69 mmol/L', () => expect(val('triglyceride', 150, 'mg/dL', 'mmol/L')).toBeCloseTo(1.694, 2));
});

describe('refusals carry a reason', () => {
  it('glucose mg/dL → U/L', () => {
    const r = run('glucose', 100, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/변환 거부|차원/);
  });
  it('ALT mg/dL → U/L', () => {
    const r = run('alt', 40, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/효소/);
  });
  it('albumin g/dL → mmol/L (no MW basis)', () => {
    const r = run('albumin', 4, 'g/dL', 'mmol/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/분자량/);
  });
  it('phosphate → mEq/L (no charge basis)', () => expect(run('phosphate', 3, 'mg/dL', 'meq/L').ok).toBe(false));
  it('unknown unit', () => expect(run('glucose', 1, 'foo', 'mmol/L').ok).toBe(false));
  it('HbA1c to mg/dL', () => expect(run('hba1c', 6, '%', 'mg/dL').ok).toBe(false));
});

describe('basis is present on success', () => {
  it('has method/formula/sources', () => {
    const r = run('glucose', 100, 'mg/dL', 'mmol/L');
    expect(r.ok && r.basis.sources.length > 0 && r.basis.formula.length > 0 && r.basis.assumptions.length > 0).toBe(true);
  });
});

describe('search', () => {
  it('finds by English, Korean and synonym', () => {
    expect(findAnalytes('glucose').map((a) => a.id)).toContain('glucose');
    expect(findAnalytes('혈당').map((a) => a.id)).toContain('glucose');
    expect(findAnalytes('sgpt').map((a) => a.id)).toContain('alt');
  });
  it('all analytes with formula have computable molar mass', () => {
    for (const a of ANALYTES) if (a.formula) expect(molarMass(a.formula).value).toBeGreaterThan(0);
  });
});

describe('reference intervals', () => {
  it('returns the published interval only inside the age range', () => {
    const l = lookupInterval({ analyteId: 'creatinine', ageYears: 40, sex: 'M' });
    expect(l.matches).toHaveLength(1);
    expect([l.matches[0].low, l.matches[0].high]).toEqual([60, 110]);
  });
  it('does not extrapolate (creatinine 70y, child 10y)', () => {
    expect(lookupInterval({ analyteId: 'creatinine', ageYears: 70, sex: 'F' }).matches).toHaveLength(0);
    const kid = lookupInterval({ analyteId: 'sodium', ageYears: 10, sex: 'M' });
    expect(kid.matches).toHaveLength(0);
    expect(kid.pediatric).toBe(true);
  });
  it('analyte with no data returns reason', () => {
    const l = lookupInterval({ analyteId: 'glucose', ageYears: 40, sex: 'M' });
    expect(l.matches).toHaveLength(0);
    expect(l.reason).toBeTruthy();
  });
  it('judges low / normal / high with inclusive limits', () => {
    const r = { low: 135, high: 145 };
    expect([judge(134, r), judge(135, r), judge(145, r), judge(146, r)]).toEqual(['low', 'normal', 'normal', 'high']);
  });
  it('every row is flagged unverified until checked against the source', () => {
    expect(REFERENCE_INTERVALS.every((r) => r.verified === false)).toBe(true);
  });
});
