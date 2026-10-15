import { ATOMIC_WEIGHTS } from '../data/atomicWeights';

export interface MolarMass {
  value: number;
  parts: { element: string; count: number; weight: number }[];
}

/** Molar mass (g/mol) from a simple formula such as "C6H12O6" (no parentheses). */
export function molarMass(formula: string): MolarMass {
  const re = /([A-Z][a-z]?)(\d*)/g;
  const parts: MolarMass['parts'] = [];
  let consumed = 0;
  for (const m of formula.matchAll(re)) {
    const weight = ATOMIC_WEIGHTS[m[1]];
    if (weight === undefined) throw new Error(`Unknown element ${m[1]} in ${formula}`);
    parts.push({ element: m[1], count: m[2] ? Number(m[2]) : 1, weight });
    consumed += m[0].length;
  }
  if (consumed !== formula.length || parts.length === 0) throw new Error(`Bad formula ${formula}`);
  return { value: parts.reduce((s, p) => s + p.count * p.weight, 0), parts };
}
