import { UcumLhcUtils } from '@lhncbc/ucum-lhc';
import type { Analyte } from '../data/analytes';
import { molarMass } from './molarMass';
import { ATOMIC_WEIGHTS_SOURCE } from '../data/atomicWeights';

const ucum = UcumLhcUtils.getInstance();

export interface Source { label: string; url: string }
export interface Basis {
  method: string;
  /** Effective multiplier (result per 1 input unit); null for non-proportional (offset) formulas. */
  factor: number | null;
  formula: string;
  assumptions: string[];
  sources: Source[];
}
export type ConvertResult =
  | { ok: true; value: number; basis: Basis }
  | { ok: false; reason: string };

const UCUM_SRC: Source = { label: 'UCUM (ucum.org)', url: 'https://ucum.org/ucum' };
const UCUM_LHC_SRC: Source = { label: '@lhncbc/ucum-lhc', url: 'https://github.com/lhncbc/ucum-lhc' };
const IUPAC_SRC: Source = { label: 'IUPAC/CIAAW 표준 원자량', url: ATOMIC_WEIGHTS_SOURCE };
const NGSP_SRC: Source = { label: 'NGSP–IFCC (ngsp.org/ifcc.asp)', url: 'https://www.ngsp.org/ifcc.asp' };
const KDIGO_SRC: Source = { label: 'KDIGO 2024 CKD Guideline', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' };

const hasMole = (u: string) => /mol/i.test(u);
const hasEq = (u: string) => /eq/i.test(u);

function fmtNum(n: number) {
  return Number(n.toPrecision(6)).toString();
}

function ucumConvert(from: string, v: number, to: string, mw?: number, charge?: number) {
  const opts: { molecularWeight?: number; charge?: number } = {};
  if (mw) opts.molecularWeight = mw;
  if (charge) opts.charge = charge;
  return ucum.convertUnitTo(from, v, to, opts);
}

function hba1c(a: Analyte, v: number, from: string, to: string): ConvertResult {
  const sources = [NGSP_SRC];
  if (from === to) return { ok: true, value: v, basis: { method: '동일 단위', factor: 1, formula: 'x → x', assumptions: [], sources } };
  if (from === '%' && to === 'mmol/mol') {
    return {
      ok: true, value: 10.93 * v - 23.5,
      basis: { method: 'NGSP→IFCC 마스터 방정식', factor: null, formula: 'IFCC(mmol/mol) = 10.93 × NGSP(%) − 23.50', assumptions: ['NGSP 인증 방법과 IFCC 기준측정법 간의 선형 관계 가정'], sources },
    };
  }
  if (from === 'mmol/mol' && to === '%') {
    return {
      ok: true, value: 0.09148 * v + 2.152,
      basis: { method: 'IFCC→NGSP 마스터 방정식', factor: null, formula: 'NGSP(%) = 0.09148 × IFCC(mmol/mol) + 2.152', assumptions: ['NGSP 인증 방법과 IFCC 기준측정법 간의 선형 관계 가정'], sources },
    };
  }
  return { ok: false, reason: `${a.ko}은(는) % (NGSP) ↔ mmol/mol (IFCC) 변환만 지원합니다.` };
}

function ratio(a: Analyte, v: number, from: string, to: string): ConvertResult {
  const units = ['mg/g', 'mg/mmol'];
  if (!units.includes(from) || !units.includes(to)) {
    return { ok: false, reason: `${a.ko}은(는) mg/g ↔ mg/mmol (크레아티닌 기준) 변환만 지원합니다.` };
  }
  const mm = molarMass(a.formula!);
  const sources = [KDIGO_SRC, UCUM_SRC, IUPAC_SRC];
  if (from === to) return { ok: true, value: v, basis: { method: '동일 단위', factor: 1, formula: 'x → x', assumptions: [], sources } };
  // 1 g creatinine -> mmol via UCUM with creatinine molar mass
  const mmolPerG = ucumConvert('g', 1, 'mmol', mm.value).toVal as number;
  const value = from === 'mg/g' ? v / mmolPerG : v * mmolPerG;
  const factor = from === 'mg/g' ? 1 / mmolPerG : mmolPerG;
  return {
    ok: true, value,
    basis: {
      method: '분모(크레아티닌)의 질량→몰 환산',
      factor,
      formula: from === 'mg/g'
        ? `mg/mmol = (mg/g) ÷ (1000 mg ÷ ${fmtNum(mm.value)} g/mol = ${fmtNum(mmolPerG)} mmol/g)`
        : `mg/g = (mg/mmol) × ${fmtNum(mmolPerG)} mmol/g`,
      assumptions: [`분모는 크레아티닌(C4H7N3O, ${fmtNum(mm.value)} g/mol). 분자(알부민 또는 단백)의 질량 단위는 그대로 유지.`],
      sources,
    },
  };
}

export function convert(a: Analyte, value: number, from: string, to: string): ConvertResult {
  if (!Number.isFinite(value)) return { ok: false, reason: '숫자를 입력해 주세요.' };
  from = from.trim(); to = to.trim();
  if (!from || !to) return { ok: false, reason: '원본/대상 단위를 입력해 주세요.' };
  if (a.kind === 'hba1c') return hba1c(a, value, from, to);
  if (a.kind === 'ratio') return ratio(a, value, from, to);

  const needMole = hasMole(from) !== hasMole(to);
  const needEq = hasEq(from) !== hasEq(to);
  if (needMole && !a.formula) {
    return { ok: false, reason: `${a.ko}은(는) 단일 분자량 근거가 없어 질량↔몰 환산을 하지 않습니다 (질량 단위끼리만 변환 가능).` };
  }
  if (needEq && !a.charge) {
    return { ok: false, reason: `${a.ko}은(는) 이온 전하 근거가 없어 mEq/L 환산을 제공하지 않습니다.${a.id === 'phosphate' ? ' (인산염 전하는 pH 의존)' : ''}` };
  }
  const mm = a.formula ? molarMass(a.formula) : undefined;
  const r = ucumConvert(from, value, to, mm?.value, a.charge);
  if (r.status !== 'succeeded' || r.toVal === null) {
    if (r.code === 'unknown-unit') return { ok: false, reason: `UCUM에서 인식할 수 없는 단위입니다: ${r.msg.join(' ')}` };
    if (r.code === 'incommensurable') {
      const hint = a.kind === 'enzyme'
        ? '효소는 활성(U/L, µkat/L) 단위로 보고되며 질량·몰 농도와는 물리 차원이 달라 변환 근거가 없습니다 (측정법·기질·온도에 따라 달라지는 활성 단위).'
        : '두 단위의 차원이 달라(예: 질량 농도 vs 효소 활성) 변환할 수 없습니다.';
      return { ok: false, reason: `${from} → ${to} 변환 거부: ${hint}` };
    }
    return { ok: false, reason: `변환 실패(${r.code ?? r.status}): ${r.msg.join(' ')}` };
  }
  const one = ucumConvert(from, 1, to, mm?.value, a.charge).toVal as number;
  const assumptions: string[] = [];
  const sources: Source[] = [UCUM_SRC, UCUM_LHC_SRC];
  let method = 'UCUM 단위 스케일 변환 (차원 동일)';
  let formula = `결과 = 입력 × ${fmtNum(one)}  (UCUM이 두 단위의 SI 배율 비로 계산)`;
  if (needMole || needEq) {
    sources.push(IUPAC_SRC);
    assumptions.push(`분자량 ${a.formula} = ${mm!.parts.map((p) => `${p.element}${p.count > 1 ? '×' + p.count : ''}(${p.weight})`).join(' + ')} = ${fmtNum(mm!.value)} g/mol`);
    if (needEq) {
      method = '분자량 + 이온 전하 (질량·몰 → 당량)';
      formula = `mEq = mmol × |전하| (${a.charge}),  mmol = mg ÷ ${fmtNum(mm!.value)} g/mol  →  결과 = 입력 × ${fmtNum(one)}`;
      assumptions.push(`|전하| = ${a.charge}`);
    } else {
      method = '분자량 기반 질량 ↔ 몰 환산 (UCUM + IUPAC 원자량)';
      formula = `mmol/L = mg/L ÷ ${fmtNum(mm!.value)} g/mol  →  결과 = 입력 × ${fmtNum(one)}`;
    }
  }
  if (a.assumption) assumptions.push(a.assumption);
  return { ok: true, value: r.toVal, basis: { method, factor: one, formula, assumptions, sources } };
}
